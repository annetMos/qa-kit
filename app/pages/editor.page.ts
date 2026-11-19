import { Locator, Page } from '@playwright/test';
import { BasePage } from '../../src/modules/ui';
import { NewArticle } from '../api/articles.api';

/** Article editor: /editor. Available to logged-in users only. */
export class EditorPage extends BasePage {
  protected readonly path = '/editor';

  readonly titleInput: Locator;
  readonly descriptionInput: Locator;
  readonly bodyInput: Locator;
  readonly publishButton: Locator;
  readonly signInPrompt: Locator;

  constructor(page: Page) {
    super(page);
    this.titleInput = page.getByPlaceholder('Article Title');
    this.descriptionInput = page.getByPlaceholder("What's this article about?");
    this.bodyInput = page.getByPlaceholder('Write your article (in markdown)');
    this.publishButton = page.getByRole('button', { name: 'Publish Article' });
    // The header has the same link, so search only in the main content
    this.signInPrompt = page.getByRole('main').getByRole('link', { name: 'Sign in' });
  }

  /** Fill in the form and publish the article. */
  async publish(article: NewArticle): Promise<void> {
    await this.titleInput.fill(article.title);
    await this.descriptionInput.fill(article.description);
    await this.bodyInput.fill(article.body);
    await this.publishButton.click();
  }
}
