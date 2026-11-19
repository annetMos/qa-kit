import { test as base } from '@playwright/test';
import { ModuleManifest } from '../../core/module';

export { Builder } from './builder';
export { unique } from './unique';

export const testDataManifest: ModuleManifest = {
  name: 'test-data',
  description: 'Test data builders with valid defaults and unique values safe for parallel runs',
  fixtures: ["none — import { Builder, unique } from '@qa-kit/core'"],
  example: `const article = new ArticleBuilder().withTitle(unique.title('Promo')).build();`,
};

/** The test-data module adds no fixtures — builders are plain classes. */
export const test = base;
