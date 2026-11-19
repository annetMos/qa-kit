import { expect, test } from '../app/fixtures';
import { ArticleBuilder } from '../app/data/article.builder';

/**
 * Plain API test example using the raw `api` fixture:
 * handy for negative checks where a typed client gets in the way.
 */
test.describe('API: articles', () => {
  test('cannot create an article without a token', async ({ api }) => {
    const response = await api.post('articles', {
      data: { article: new ArticleBuilder().build() },
    });

    expect(response.status()).toBe(401);
  });

  test('created article can be fetched by slug', async ({ articlesApi, cleanup }) => {
    const created = await articlesApi.create(new ArticleBuilder().withTags('api', 'smoke').build());
    cleanup.add(`article ${created.slug}`, () => articlesApi.remove(created.slug));

    const fetched = await articlesApi.getBySlug(created.slug);

    expect(fetched).toMatchObject({ title: created.title, body: created.body, tagList: ['api', 'smoke'] });
  });

  test('parallel-safe data: articles built in a batch have unique titles', async () => {
    const titles = new ArticleBuilder().buildMany(5).map((article) => article.title);

    expect(new Set(titles).size).toBe(titles.length);
  });
});
