import { APIRequestContext, test as base, request as playwrightRequest } from '@playwright/test';
import { EnvConfig } from '../../core/config';
import { ModuleManifest } from '../../core/module';
import { CleanupRegistry } from './cleanup';

export { BaseApiClient } from './base-api-client';
export { CleanupRegistry } from './cleanup';

export const apiManifest: ModuleManifest = {
  name: 'api',
  description: 'HTTP-клиент к API, подготовка данных и автоочистка после теста',
  fixtures: ['api', 'cleanup'],
  example: `test('...', async ({ api, cleanup }) => { /* api.post(...) */ });`,
};

export type ApiFixtures = {
  /** Контекст запросов к API_URL (без авторизации). */
  api: APIRequestContext;
  /** Регистрация удаления тестовых данных после теста. */
  cleanup: CleanupRegistry;
};

export const test = base.extend<ApiFixtures>({
  api: async ({}, use) => {
    const context = await playwrightRequest.newContext({ baseURL: EnvConfig.get().apiUrl });
    await use(context);
    await context.dispose();
  },
  cleanup: async ({}, use) => {
    const registry = new CleanupRegistry();
    await use(registry);
    await registry.runAll();
  },
});
