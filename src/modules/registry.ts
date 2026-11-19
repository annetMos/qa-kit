import { ModuleManifest } from '../core/module';
import { apiManifest } from './api';
import { uiManifest } from './ui';

/**
 * Список подключённых модулей.
 * Чтобы отключить модуль — уберите его отсюда и из `src/fixtures.ts`.
 */
export const enabledModules: readonly ModuleManifest[] = [uiManifest, apiManifest];
