import { ModuleManifest } from '../core/module';
import { apiManifest } from './api';
import { authManifest } from './auth';
import { uiManifest } from './ui';

/**
 * Enabled modules.
 * To disable a module, remove it here and in `src/fixtures.ts`.
 */
export const enabledModules: readonly ModuleManifest[] = [uiManifest, apiManifest, authManifest];
