import { test as base } from '@playwright/test';
import { ModuleManifest } from '../../core/module';

export { BasePage } from './base-page';

export const uiManifest: ModuleManifest = {
  name: 'ui',
  description: 'Page Objects for the web UI on top of Playwright Page',
  fixtures: ['page (Playwright)'],
  example: `const article = await new ArticlePage(page, slug).open();`,
};

/** The UI module adds no fixtures — Page Objects are created from `page`. */
export const test = base;
