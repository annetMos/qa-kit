import { Locator, Page } from '@playwright/test';
import { BasePage } from '../../src/modules/ui';
import { NewArticle } from '../api/articles.api';

/**
 * Article editor: `/editor`. Logged-in users see the form; guests see a sign-in prompt.
 *
 * @example
 * ```ts
 * test.use({ role: 'user' });
 *
 * const editor = await new EditorPage(page).open();
 * await editor.publish(new ArticleBuilder().build());
 * ```
 */
export class EditorPage extends BasePage {
  protected readonly path = '/editor';

  /** "Article Title" input. */
  readonly titleInput: Locator;
  /** "What's this article about?" input. */
  readonly descriptionInput: Locator;
  /** Article text area. */
  readonly bodyInput: Locator;
  /** "Publish Article" button. Hidden for guests. */
  readonly publishButton: Locator;
  /** "Sign in" link shown to guests instead of the form. */
  readonly signInPrompt: Locator;

  /** @param page - Playwright page from the `page` fixture. */
  constructor(page: Page) {
    super(page);
    this.titleInput = page.getByPlaceholder('Article Title');
    this.descriptionInput = page.getByPlaceholder("What's this article about?");
    this.bodyInput = page.getByPlaceholder('Write your article (in markdown)');
    this.publishButton = page.getByRole('button', { name: 'Publish Article' });
    // The header has the same link, so search only in the main content
    this.signInPrompt = page.getByRole('main').getByRole('link', { name: 'Sign in' });
  }

  /**
   * Fill in title, description and body, then click "Publish Article".
   * After publishing, the app opens the article page.
   * Tags are not filled in — the editor has no tags field.
   * @param article - Article data — build it with `new ArticleBuilder()…build()`.
   * @example
   * ```ts
   * await editor.publish(new ArticleBuilder().withBody('Text').build());
   * await expect(page).toHaveURL(/\/article\//);
   * ```
   */
  async publish(article: NewArticle): Promise<void> {
    await this.titleInput.fill(article.title);
    await this.descriptionInput.fill(article.description);
    await this.bodyInput.fill(article.body);
    await this.publishButton.click();
  }
}
