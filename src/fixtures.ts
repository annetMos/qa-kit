import { mergeTests } from '@playwright/test';
import { test as apiTest } from './modules/api';
import { test as authTest } from './modules/auth';
import { test as testDataTest } from './modules/test-data';
import { test as uiTest } from './modules/ui';

/**
 * Framework base `test`: merges fixtures of all enabled modules.
 * Don't need a module? Remove it from the list — the rest keep working.
 */
export const test = mergeTests(uiTest, apiTest, authTest, testDataTest);
export { expect } from '@playwright/test';
