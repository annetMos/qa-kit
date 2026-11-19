import { expect, test } from '../app/fixtures';
import { ArticlePage } from '../app/pages/article.page';
import { EditorPage } from '../app/pages/editor.page';
import { HeaderComponent } from '../app/pages/header.component';

test.describe('Гость', () => {
  test('видит ссылку входа и не может писать статьи', async ({ page }) => {
    const editor = await new EditorPage(page).open();

    await expect(new HeaderComponent(page).signInLink).toBeVisible();
    await expect(editor.signInPrompt).toBeVisible();
    await expect(editor.publishButton).toBeHidden();
  });
});

test.describe('Пользователь', () => {
  // Браузер стартует уже залогиненным — без UI-логина в каждом тесте
  test.use({ role: 'user' });

  test('видит своё имя в шапке', async ({ page }) => {
    await page.goto('/');

    await expect(new HeaderComponent(page).currentUser).toHaveText('qa');
  });

  test('статья, опубликованная через UI, доступна через API', async ({ page, articlesApi, cleanup }) => {
    const title = `UI ${Date.now()}`;

    await test.step('Опубликовать статью в редакторе', async () => {
      const editor = await new EditorPage(page).open();
      await editor.publish({ title, description: 'Создано через UI', body: 'Текст из редактора' });
    });

    const slug = await test.step('Дождаться страницы статьи', async () => {
      await expect(page).toHaveURL(/\/article\//);
      const slugFromUrl = decodeURIComponent(new URL(page.url()).pathname.split('/').pop() ?? '');
      cleanup.add(`статья ${slugFromUrl}`, () => articlesApi.remove(slugFromUrl));
      await expect(new ArticlePage(page, slugFromUrl).title).toHaveText(title);
      return slugFromUrl;
    });

    await test.step('Проверить статью через API', async () => {
      const article = await articlesApi.getBySlug(slug);
      expect(article).toMatchObject({ title, body: 'Текст из редактора' });
    });
  });
});
