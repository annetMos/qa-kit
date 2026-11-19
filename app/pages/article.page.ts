import { Locator, Page } from '@playwright/test';
import { BasePage } from '@qa-kit/core';

/**
 * Article page: `/article/<slug>`.
 *
 * @example
 * ```ts
 * const articlePage = await new ArticlePage(page, article.slug).open();
 * await expect(articlePage.title).toHaveText(article.title);
 * ```
 */
export class ArticlePage extends BasePage {
  protected readonly path: string;

  /** Main heading: the article title, or "Article not found" for a missing article. */
  readonly title: Locator;
  /** Article text block. */
  readonly body: Locator;

  /**
   * @param page - Playwright page from the `page` fixture.
   * @param slug - Article id, e.g. `article.slug` returned by `articlesApi.create()`.
   */
  constructor(page: Page, slug: string) {
    super(page);
    this.path = `/article/${slug}`;
    this.title = page.getByRole('heading', { level: 1 });
    this.body = page.locator('.article-content');
  }
}
