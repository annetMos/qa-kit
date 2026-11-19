import { APIRequestContext } from '@playwright/test';
import { BaseApiClient } from '../../src/modules/api';

export type NewArticle = { title: string; description: string; body: string; tagList?: string[] };
export type Article = NewArticle & { slug: string; createdAt: string };
type ArticleResponse = { article: Article };

/** API статей (пример для RealWorld/Conduit). */
export class ArticlesApi extends BaseApiClient {
  constructor(request: APIRequestContext) {
    super(request);
  }

  /** Создать статью. Требует авторизованный контекст. */
  async create(article: NewArticle): Promise<Article> {
    return (await this.post<ArticleResponse>('articles', { article })).article;
  }

  /** Получить статью по slug. */
  async getBySlug(slug: string): Promise<Article> {
    return (await this.get<ArticleResponse>(`articles/${slug}`)).article;
  }

  /** Удалить статью. Требует авторизованный контекст. */
  async remove(slug: string): Promise<void> {
    await this.delete(`articles/${slug}`, 200);
  }
}
