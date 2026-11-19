/**
 * @qa-kit/core — modular Playwright + TypeScript building blocks for end-to-end feature checks (API + UI).
 * @see {@link https://github.com/annetMos/qa-kit | GitHub: qa-kit}
 */

// All modules together
export { test, expect } from './fixtures';

// Core
export { EnvConfig } from './core/config';
export type { ModuleManifest } from './core/module';
export { modules } from './registry';

// ui
export { test as uiTest, uiManifest, BasePage } from './modules/ui';

// api
export { test as apiTest, apiManifest, BaseApiClient, CleanupRegistry } from './modules/api';
export type { ApiFixtures } from './modules/api';

// auth
export {
  test as authTest,
  authManifest,
  TokenAuthStrategy,
  CookieAuthStrategy,
  SessionManager,
} from './modules/auth';
export type {
  AuthStrategy,
  AuthTestFixtures,
  AuthTestOptions,
  AuthWorkerFixtures,
  Credentials,
  Session,
  StorageState,
  UsersByRole,
} from './modules/auth';

// test-data
export { test as testDataTest, testDataManifest, Builder, unique } from './modules/test-data';
