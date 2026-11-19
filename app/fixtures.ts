import { EnvConfig } from '../src/core/config';
import { test as base } from '../src/fixtures';
import { ArticlesApi } from './api/articles.api';
import { ConduitAuthStrategy } from './auth/conduit-auth.strategy';

type AppFixtures = {
  /** API статей от имени текущей роли (или роли по умолчанию). */
  articlesApi: ArticlesApi;
};

/**
 * `test` конкретного проекта: фикстуры фреймворка + настройки и клиенты приложения.
 * Именно его импортируют тесты.
 */
export const test = base.extend<AppFixtures>({
  // Как входить в это приложение
  authStrategy: [
    async ({}, use) => {
      await use(new ConduitAuthStrategy(EnvConfig.get().baseUrl));
    },
    { scope: 'worker' },
  ],

  // Роли можно расширить, например: admin: { email: process.env.ADMIN_EMAIL!, password: ... }
  // users: [async ({}, use) => use({ user: {...}, admin: {...} }), { scope: 'worker' }],

  articlesApi: async ({ authorizedApi, cleanup }, use) => {
    await use(new ArticlesApi(authorizedApi));
    // Сначала удаляем тестовые данные, пока авторизованный контекст ещё жив
    await cleanup.runAll();
  },
});

export { expect } from '../src/fixtures';
