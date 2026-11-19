import { Locator, Page } from '@playwright/test';
import { BasePage } from '../../src/modules/ui';

/** Страница статьи: /article/:slug. Селекторы — пример для Conduit, адаптируйте под свой проект. */
export class ArticlePage extends BasePage {
  protected readonly path: string;

  readonly title: Locator;
  readonly body: Locator;

  constructor(page: Page, slug: string) {
    super(page);
    this.path = `/article/${slug}`;
    this.title = page.getByRole('heading', { level: 1 });
    this.body = page.locator('.article-content');
  }
}
