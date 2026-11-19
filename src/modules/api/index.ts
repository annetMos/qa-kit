import { APIRequestContext, test as base, request as playwrightRequest } from '@playwright/test';
import { EnvConfig } from '../../core/config';
import { ModuleManifest } from '../../core/module';
import { CleanupRegistry } from './cleanup';

export { BaseApiClient } from './base-api-client';
export { CleanupRegistry } from './cleanup';

export const apiManifest: ModuleManifest = {
  name: 'api',
  description: 'HTTP client for the API, test data setup and automatic cleanup',
  fixtures: ['api', 'cleanup'],
  example: `test('...', async ({ api, cleanup }) => { /* api.post(...) */ });`,
};

export type ApiFixtures = {
  /** Request context for API_URL (unauthenticated). */
  api: APIRequestContext;
  /** Register test data removal after the test. */
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
