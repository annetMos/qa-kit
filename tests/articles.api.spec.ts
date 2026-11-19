import { expect, test } from '../app/fixtures';

/**
 * Plain API test example using the raw `api` fixture:
 * handy for negative checks where a typed client gets in the way.
 */
test.describe('API: articles', () => {
  test('cannot create an article without a token', async ({ api }) => {
    const response = await api.post('articles', {
      data: { article: { title: 'Unauthorized', description: '-', body: '-' } },
    });

    expect(response.status()).toBe(401);
  });

  test('created article can be fetched by slug', async ({ articlesApi, cleanup }) => {
    const created = await articlesApi.create({
      title: `API ${Date.now()}`,
      description: 'Read check',
      body: 'Text',
    });
    cleanup.add(`article ${created.slug}`, () => articlesApi.remove(created.slug));

    const fetched = await articlesApi.getBySlug(created.slug);

    expect(fetched).toMatchObject({ title: created.title, body: created.body });
  });
});
