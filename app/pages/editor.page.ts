import { Locator, Page } from '@playwright/test';
import { BasePage } from '../../src/modules/ui';
import { NewArticle } from '../api/articles.api';

/** Редактор статьи: /editor. Доступен только залогиненному пользователю. */
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
    // Такая же ссылка есть в шапке, поэтому ищем только в основной части страницы
    this.signInPrompt = page.getByRole('main').getByRole('link', { name: 'Sign in' });
  }

  /** Заполнить форму и опубликовать статью. */
  async publish(article: NewArticle): Promise<void> {
    await this.titleInput.fill(article.title);
    await this.descriptionInput.fill(article.description);
    await this.bodyInput.fill(article.body);
    await this.publishButton.click();
  }
}
