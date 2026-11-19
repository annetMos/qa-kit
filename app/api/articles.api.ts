import { APIRequestContext } from '@playwright/test';
import { BaseApiClient } from '../../src/modules/api';

export type NewArticle = { title: string; description: string; body: string; tagList?: string[] };
export type Article = NewArticle & { slug: string; createdAt: string };
type ArticleResponse = { article: Article };

/** Articles API (RealWorld/Conduit example). */
export class ArticlesApi extends BaseApiClient {
  constructor(request: APIRequestContext) {
    super(request);
  }

  /** Create an article. Requires an authenticated context. */
  async create(article: NewArticle): Promise<Article> {
    return (await this.post<ArticleResponse>('articles', { article })).article;
  }

  /** Get an article by slug. */
  async getBySlug(slug: string): Promise<Article> {
    return (await this.get<ArticleResponse>(`articles/${slug}`)).article;
  }

  /** Delete an article. Requires an authenticated context. */
  async remove(slug: string): Promise<void> {
    await this.delete(`articles/${slug}`, 200);
  }
}
