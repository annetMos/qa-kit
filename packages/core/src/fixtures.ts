import { mergeTests } from '@playwright/test';
import { test as apiTest } from './modules/api';
import { test as authTest } from './modules/auth';
import { test as testDataTest } from './modules/test-data';
import { test as uiTest } from './modules/ui';

/**
 * Playwright `test` with all qa-kit modules: `ui`, `api`, `auth`, `test-data`.
 *
 * Extend it in your project to add your own fixtures (API clients, login strategy).
 * Need only some modules? Compose them yourself with `mergeTests(uiTest, apiTest, ...)`.
 *
 * @example
 * ```ts
 * // app/fixtures.ts
 * import { test as base } from '@qa-kit/core';
 *
 * export const test = base.extend<{ usersApi: UsersApi }>({
 *   usersApi: async ({ authorizedApi }, use) => use(new UsersApi(authorizedApi)),
 * });
 * ```
 */
export const test = mergeTests(uiTest, apiTest, authTest, testDataTest);
export { expect } from '@playwright/test';
