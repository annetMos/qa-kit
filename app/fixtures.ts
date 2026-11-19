import { request as playwrightRequest } from '@playwright/test';
import { EnvConfig } from '../src/core/config';
import { test as base } from '../src/fixtures';
import { ArticlesApi } from './api/articles.api';
import { AuthApi } from './api/auth.api';

type AppFixtures = {
  /** API статей от имени тестового пользователя (USER_EMAIL из .env). */
  articlesApi: ArticlesApi;
};

/**
 * `test` конкретного проекта: фикстуры фреймворка + доменные клиенты.
 * Именно его импортируют тесты.
 */
export const test = base.extend<AppFixtures>({
  articlesApi: async ({ api, cleanup }, use) => {
    const config = EnvConfig.get();
    const token = await new AuthApi(api).login(config.userEmail, config.userPassword);
    const authorized = await playwrightRequest.newContext({
      baseURL: config.apiUrl,
      extraHTTPHeaders: { Authorization: `Token ${token}` },
    });
    await use(new ArticlesApi(authorized));
    // Сначала удаляем тестовые данные, пока авторизованный контекст ещё жив
    await cleanup.runAll();
    await authorized.dispose();
  },
});

export { expect } from '../src/fixtures';
