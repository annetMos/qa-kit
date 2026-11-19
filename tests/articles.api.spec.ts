import { expect, test } from '../app/fixtures';

/**
 * Пример чистого API-теста на «сырой» фикстуре `api`:
 * полезно для негативных проверок, когда типизированный клиент мешает.
 */
test.describe('API: статьи', () => {
  test('без токена создать статью нельзя', async ({ api }) => {
    const response = await api.post('articles', {
      data: { article: { title: 'Без авторизации', description: '-', body: '-' } },
    });

    expect(response.status()).toBe(401);
  });

  test('созданную статью можно получить по slug', async ({ articlesApi, cleanup }) => {
    const created = await articlesApi.create({
      title: `API ${Date.now()}`,
      description: 'Проверка чтения',
      body: 'Текст',
    });
    cleanup.add(`статья ${created.slug}`, () => articlesApi.remove(created.slug));

    const fetched = await articlesApi.getBySlug(created.slug);

    expect(fetched).toMatchObject({ title: created.title, body: created.body });
  });
});
