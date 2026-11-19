import { Locator, Page } from '@playwright/test';
import { BasePage } from '../../src/modules/ui';

/** Article page: /article/:slug. Selectors are a Conduit example — adapt them to your project. */
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
