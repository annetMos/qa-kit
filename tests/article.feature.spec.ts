import { expect, test } from '../app/fixtures';
import { ArticlePage } from '../app/pages/article.page';

/**
 * Пример фичевого теста «API + UI»:
 * данные готовим через API (быстро и стабильно),
 * проверяем то, что видит пользователь, через UI,
 * убираем за собой автоматически через cleanup.
 */
test.describe('Фича: публикация статьи', () => {
  test('статья, созданная через API, отображается на странице', async ({ page, articlesApi, cleanup }) => {
    const article = await test.step('Создать статью через API', async () => {
      const created = await articlesApi.create({
        title: `Автотест ${Date.now()}`,
        description: 'Создано автотестом',
        body: 'Текст статьи из автотеста',
      });
      cleanup.add(`статья ${created.slug}`, () => articlesApi.remove(created.slug));
      return created;
    });

    await test.step('Открыть статью в UI и проверить содержимое', async () => {
      const articlePage = await new ArticlePage(page, article.slug).open();
      await expect(articlePage.title).toHaveText(article.title);
      await expect(articlePage.body).toContainText(article.body);
    });
  });
});
