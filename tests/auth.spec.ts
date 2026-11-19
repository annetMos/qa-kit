import { expect, test } from '../app/fixtures';
import { ArticlePage } from '../app/pages/article.page';
import { EditorPage } from '../app/pages/editor.page';
import { HeaderComponent } from '../app/pages/header.component';

test.describe('Guest', () => {
  test('sees the sign-in link and cannot write articles', async ({ page }) => {
    const editor = await new EditorPage(page).open();

    await expect(new HeaderComponent(page).signInLink).toBeVisible();
    await expect(editor.signInPrompt).toBeVisible();
    await expect(editor.publishButton).toBeHidden();
  });
});

test.describe('User', () => {
  // The browser starts already logged in — no UI login in every test
  test.use({ role: 'user' });

  test('sees their name in the header', async ({ page }) => {
    await page.goto('/');

    await expect(new HeaderComponent(page).currentUser).toHaveText('qa');
  });

  test('article published via UI is available via API', async ({ page, articlesApi, cleanup }) => {
    const title = `UI ${Date.now()}`;

    await test.step('Publish an article in the editor', async () => {
      const editor = await new EditorPage(page).open();
      await editor.publish({ title, description: 'Created via UI', body: 'Text from the editor' });
    });

    const slug = await test.step('Wait for the article page', async () => {
      await expect(page).toHaveURL(/\/article\//);
      const slugFromUrl = decodeURIComponent(new URL(page.url()).pathname.split('/').pop() ?? '');
      cleanup.add(`article ${slugFromUrl}`, () => articlesApi.remove(slugFromUrl));
      await expect(new ArticlePage(page, slugFromUrl).title).toHaveText(title);
      return slugFromUrl;
    });

    await test.step('Check the article via API', async () => {
      const article = await articlesApi.getBySlug(slug);
      expect(article).toMatchObject({ title, body: 'Text from the editor' });
    });
  });
});
