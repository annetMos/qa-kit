import { APIRequestContext } from '@playwright/test';
import { BaseApiClient } from '../../src/modules/api';

/** Data needed to create an article. Build it with `ArticleBuilder`. */
export type NewArticle = {
  /** Article title. */
  title: string;
  /** Short description shown in lists. */
  description: string;
  /** Article text. */
  body: string;
  /** Optional tags. */
  tagList?: string[];
};

/** Article as returned by the API. */
export type Article = NewArticle & {
  /** URL id of the article, used in `/article/<slug>` and in API paths. */
  slug: string;
  /** Creation time, ISO string. */
  createdAt: string;
};

type ArticleResponse = { article: Article };

/**
 * Articles API (RealWorld/Conduit). In tests use the ready `articlesApi` fixture —
 * it is already authenticated.
 *
 * @example
 * ```ts
 * const article = await articlesApi.create(new ArticleBuilder().build());
 * cleanup.add(`article ${article.slug}`, () => articlesApi.remove(article.slug));
 * ```
 */
export class ArticlesApi extends BaseApiClient {
  /** @param request - Use `authorizedApi`: create and delete need a logged-in user. */
  constructor(request: APIRequestContext) {
    super(request);
  }

  /**
   * Create an article. Expects status 201.
   * Remember to register removal with `cleanup.add(...)`.
   * @param article - Article data — build it with `new ArticleBuilder()…build()`.
   * @returns The created article, including its `slug`.
   * @example
   * ```ts
   * const article = await articlesApi.create(new ArticleBuilder().withTags('news').build());
   * ```
   */
  async create(article: NewArticle): Promise<Article> {
    return (await this.post<ArticleResponse>('articles', { article })).article;
  }

  /**
   * Get an article by its slug. Expects status 200.
   * @param slug - Article id from `create()` or from the page URL.
   * @example
   * ```ts
   * const article = await articlesApi.getBySlug(created.slug);
   * expect(article.title).toBe(created.title);
   * ```
   */
  async getBySlug(slug: string): Promise<Article> {
    return (await this.get<ArticleResponse>(`articles/${slug}`)).article;
  }

  /**
   * Delete an article. Expects status 200. Only the author can delete an article.
   * @param slug - Article id.
   * @example
   * ```ts
   * cleanup.add(`article ${article.slug}`, () => articlesApi.remove(article.slug));
   * ```
   */
  async remove(slug: string): Promise<void> {
    await this.delete(`articles/${slug}`, 200);
  }
}
