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
  description: 'Вход через API один раз на роль; браузер и API-запросы уже авторизованы',
  fixtures: ['role (опция)', 'authorizedApi', 'sessions', 'users', 'authStrategy'],
  example: `test.use({ role: 'user' }); test('...', async ({ page, authorizedApi }) => { ... });`,
};

export type AuthTestOptions = {
  /**
   * Роль, под которой выполняется тест. Без роли — гость.
   * @example test.use({ role: 'admin' });
   */
  role: string | undefined;
};

export type AuthTestFixtures = {
  /** API-контекст с авторизацией текущей роли (или роли по умолчанию, если тест гостевой). */
  authorizedApi: APIRequestContext;
};

export type AuthWorkerFixtures = {
  /** Как входить в приложение. Переопределяется в app/fixtures.ts. */
  authStrategy: AuthStrategy;
  /** Пользователи по ролям. По умолчанию одна роль `user` из USER_EMAIL / USER_PASSWORD. */
  users: UsersByRole;
  /** Кэш сессий по ролям в рамках worker. */
  sessions: SessionManager;
};

export const test = base.extend<AuthTestOptions & AuthTestFixtures, AuthWorkerFixtures>({
  role: [undefined, { option: true }],

  authStrategy: [
    async ({}, _use) => {
      throw new Error(
        '[auth] Не задана стратегия входа. Переопределите фикстуру authStrategy в app/fixtures.ts ' +
          '(например, наследником TokenAuthStrategy).',
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

  // Если задана роль — браузер стартует уже залогиненным
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
