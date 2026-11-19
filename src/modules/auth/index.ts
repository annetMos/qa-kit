import { APIRequestContext, test as base, request as playwrightRequest } from '@playwright/test';
import { EnvConfig } from '../../core/config';
import { ModuleManifest } from '../../core/module';
import { SessionManager } from './session-manager';
import { AuthStrategy, UsersByRole } from './types';

export { CookieAuthStrategy } from './cookie-auth-strategy';
export { SessionManager } from './session-manager';
export { TokenAuthStrategy } from './token-auth-strategy';
export type { AuthStrategy, Credentials, Session, StorageState, UsersByRole } from './types';

export const authManifest: ModuleManifest = {
  name: 'auth',
  description: 'Logs in via the API once per role (token or cookie); the browser and API requests are already authenticated',
  fixtures: ['role (option)', 'authorizedApi', 'sessions', 'users', 'authStrategy'],
  example: `test.use({ role: 'user' }); test('...', async ({ page, authorizedApi }) => { ... });`,
};

export type AuthTestOptions = {
  /**
   * Role the test runs as. Without a role the test is a **guest**.
   *
   * With a role, the browser starts already logged in and `authorizedApi` uses the same
   * session — there is no UI login in the test. Each role logs in once per worker.
   * Roles are defined by the `users` fixture in `app/fixtures.ts`.
   *
   * @example
   * ```ts
   * test.describe('Admin', () => {
   *   test.use({ role: 'admin' });
   *
   *   test('sees the admin panel', async ({ page }) => { ... });
   * });
   * ```
   * @see {@link https://github.com/annetMos/qa-kit#authentication-auth-module | README: Authentication}
   */
  role: string | undefined;
};

export type AuthTestFixtures = {
  /**
   * HTTP client for `API_URL` **with** authentication of the current role
   * (or the default role if the test is a guest).
   *
   * Pass it to typed API clients, or call it directly.
   *
   * @example
   * ```ts
   * const response = await authorizedApi.get('user');
   * expect(response.ok()).toBeTruthy();
   * ```
   */
  authorizedApi: APIRequestContext;
};

export type AuthWorkerFixtures = {
  /**
   * How to log in to your application. Override it in `app/fixtures.ts` with a
   * `TokenAuthStrategy` subclass (token in localStorage) or a `CookieAuthStrategy`
   * subclass (session cookie).
   */
  authStrategy: AuthStrategy;
  /**
   * Test users by role; the first role is the default one.
   * Default: a single `user` role from `USER_EMAIL` / `USER_PASSWORD`.
   * Override it in `app/fixtures.ts` to add roles.
   */
  users: UsersByRole;
  /** Session cache by role within a worker. Rarely needed in tests directly. */
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
      // Cookies for cookie sessions, headers for token sessions
      storageState: session.storageState,
      extraHTTPHeaders: { ...session.apiHeaders },
    });
    await use(context);
    await context.dispose();
  },
});
