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
  /**
   * Raw HTTP client for `API_URL` **without** authentication.
   *
   * Good for negative checks (e.g. "no token → 401"). For regular calls prefer typed
   * clients like `articlesApi`, and `authorizedApi` for logged-in requests.
   * Paths are relative, without a leading slash.
   *
   * @example
   * ```ts
   * const response = await api.post('articles', { data: { article } });
   * expect(response.status()).toBe(401);
   * ```
   */
  api: APIRequestContext;

  /**
   * Removes test data after the test — even if the test fails.
   *
   * @example
   * ```ts
   * const article = await articlesApi.create(new ArticleBuilder().build());
   * cleanup.add(`article ${article.slug}`, () => articlesApi.remove(article.slug));
   * ```
   */
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
