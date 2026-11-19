import { mergeTests } from '@playwright/test';
import { test as apiTest } from './modules/api';
import { test as uiTest } from './modules/ui';

/**
 * Базовый `test` фреймворка: объединяет фикстуры подключённых модулей.
 * Не нужен модуль — уберите его из списка, остальные продолжат работать.
 */
export const test = mergeTests(uiTest, apiTest);
export { expect } from '@playwright/test';
