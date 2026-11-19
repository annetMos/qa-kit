import { expect, test } from '../app/fixtures';
import { ArticleBuilder } from '../app/data/article.builder';
import { ArticlePage } from '../app/pages/article.page';

/**
 * Feature test example "API + UI":
 * set up data via the API (fast and stable),
 * check what the user sees via the UI,
 * clean up automatically via cleanup.
 */
test.describe('Feature: article publishing', () => {
  test('article created via API is shown on its page', async ({ page, articlesApi, cleanup }) => {
    const article = await test.step('Create an article via API', async () => {
      const created = await articlesApi.create(new ArticleBuilder().build());
      cleanup.add(`article ${created.slug}`, () => articlesApi.remove(created.slug));
      return created;
    });

    await test.step('Open the article in the UI and check its content', async () => {
      const articlePage = await new ArticlePage(page, article.slug).open();
      await expect(articlePage.title).toHaveText(article.title);
      await expect(articlePage.body).toContainText(article.body);
    });
  });
});
