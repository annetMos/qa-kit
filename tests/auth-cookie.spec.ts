import { test as base, expect } from '../app/fixtures';
import { DemoCookieAuthStrategy } from '../app/auth/demo-cookie-auth.strategy';
import { ArticleBuilder } from '../app/data/article.builder';
import { HeaderComponent } from '../app/pages/header.component';

/**
 * The same scenarios as in auth.spec.ts, but the demo-app session lives in an HttpOnly cookie.
 * Overriding `authStrategy` in a file is how you'd test an app with a different login method.
 */
const test = base.extend({
  authStrategy: [
    async ({}, use) => {
      await use(new DemoCookieAuthStrategy());
    },
    { scope: 'worker' },
  ],
});

test.describe('User with a cookie session', () => {
  test.use({ role: 'user' });

  test('browser gets the session cookie and no token', async ({ page }) => {
    await page.goto('/');

    const cookies = await page.context().cookies();
    expect(cookies).toContainEqual(expect.objectContaining({ name: 'sid', httpOnly: true }));
    expect(await page.evaluate(() => localStorage.getItem('jwtToken'))).toBeNull();
  });

  test('sees their name in the header', async ({ page }) => {
    await page.goto('/');

    await expect(new HeaderComponent(page).currentUser).toHaveText('qa');
  });

  test('guest `api` stays unauthenticated even in a role test', async ({ api }) => {
    // Regression: the role's session cookie must not leak into the guest client
    const response = await api.post('articles', { data: { article: new ArticleBuilder().build() } });

    expect(response.status()).toBe(401);
  });

  test('API requests are authenticated by the cookie', async ({ articlesApi, cleanup }) => {
    const article = await articlesApi.create(new ArticleBuilder().build());
    cleanup.add(`article ${article.slug}`, () => articlesApi.remove(article.slug));

    expect((await articlesApi.getBySlug(article.slug)).title).toBe(article.title);
  });
});

test.describe('Guest test with a cookie strategy', () => {
  test('authorizedApi uses the default role session', async ({ articlesApi, cleanup }) => {
    // No role here, so the browser has no session — the cookie comes only from authorizedApi
    const article = await articlesApi.create(new ArticleBuilder().build());
    cleanup.add(`article ${article.slug}`, () => articlesApi.remove(article.slug));

    expect(article.slug).toBeTruthy();
  });
});
