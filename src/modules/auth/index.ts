import { APIRequestContext, test as base, request as playwrightRequest } from '@playwright/test';
import { EnvConfig } from '../../core/config';
import { ModuleManifest } from '../../core/module';
import { SessionManager } from './session-manager';
import { AuthStrategy, UsersByRole } from './types';

export { SessionManager } from './session-manager';
export { TokenAuthStrategy } from './token-auth-strategy';
export type { AuthStrategy, Credentials, Session, StorageState, UsersByRole } from './types';

export const authManifest: ModuleManifest = {
  name: 'auth',
  description: 'Logs in via the API once per role; the browser and API requests are already authenticated',
  fixtures: ['role (option)', 'authorizedApi', 'sessions', 'users', 'authStrategy'],
  example: `test.use({ role: 'user' }); test('...', async ({ page, authorizedApi }) => { ... });`,
};

export type AuthTestOptions = {
  /**
   * Role the test runs as. No role — guest.
   * @example test.use({ role: 'admin' });
   */
  role: string | undefined;
};

export type AuthTestFixtures = {
  /** API context authenticated as the current role (or the default role if the test is a guest). */
  authorizedApi: APIRequestContext;
};

export type AuthWorkerFixtures = {
  /** How to log in to the application. Overridden in app/fixtures.ts. */
  authStrategy: AuthStrategy;
  /** Users by role. Defaults to a single `user` role from USER_EMAIL / USER_PASSWORD. */
  users: UsersByRole;
  /** Session cache by role within a worker. */
  sessions: SessionManager;
};

export const test = base.extend<AuthTestOptions & AuthTestFixtures, AuthWorkerFixtures>({
  role: [undefined, { option: true }],

  authStrategy: [
    async ({}, _use) => {
      throw new Error(
        '[auth] No login strategy configured. Override the authStrategy fixture in app/fixtures.ts ' +
          '(for example, with a TokenAuthStrategy subclass).',
      );
    },
    { scope: 'worker' },
  ],

  users: [
    async ({}, use) => {
      const config = EnvConfig.get();
      await use({ user: { email: config.userEmail, password: config.userPassword } });
    },
    { scope: 'worker' },
  ],

  sessions: [
    async ({ authStrategy, users }, use) => {
      await use(new SessionManager(authStrategy, users, EnvConfig.get().apiUrl));
    },
    { scope: 'worker' },
  ],

  // When a role is set, the browser starts already logged in
  storageState: async ({ role, sessions, storageState }, use) => {
    if (!role) {
      await use(storageState);
      return;
    }
    const session = await sessions.session(role);
    await use(session.storageState);
  },

  authorizedApi: async ({ role, sessions }, use) => {
    const session = await sessions.session(role ?? sessions.defaultRole);
    const context = await playwrightRequest.newContext({
      baseURL: EnvConfig.get().apiUrl,
      extraHTTPHeaders: { ...session.apiHeaders },
    });
    await use(context);
    await context.dispose();
  },
});
