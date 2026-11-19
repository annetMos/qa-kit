import { ModuleManifest } from './core/module';
import { apiManifest } from './modules/api';
import { authManifest } from './modules/auth';
import { testDataManifest } from './modules/test-data';
import { uiManifest } from './modules/ui';

/** All modules shipped with `@qa-kit/core`. Shown by `npx qa-kit features`. */
export const modules: readonly ModuleManifest[] = [uiManifest, apiManifest, authManifest, testDataManifest];
