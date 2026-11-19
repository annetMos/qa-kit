import { test as base } from '@playwright/test';
import { ModuleManifest } from '../../core/module';

export { BasePage } from './base-page';

export const uiManifest: ModuleManifest = {
  name: 'ui',
  description: 'Page Object для веб-интерфейса поверх Playwright Page',
  fixtures: ['page (Playwright)'],
  example: `const article = await new ArticlePage(page, slug).open();`,
};

/** UI-модуль не добавляет фикстур — Page Object создаются из `page`. */
export const test = base;
