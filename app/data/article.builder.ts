import { Builder, unique } from '../../src/modules/test-data';
import { NewArticle } from '../api/articles.api';

/**
 * Builds a valid article for tests. Every built article gets a **unique title**.
 *
 * Defaults: unique title, short description and body, no tags.
 * Change only what your test checks.
 *
 * @example
 * ```ts
 * const article = await articlesApi.create(
 *   new ArticleBuilder().withTitle('Release notes').withTags('news').build(),
 * );
 * ```
 */
export class ArticleBuilder extends Builder<NewArticle> {
  protected defaults(): NewArticle {
    return {
      title: unique.title('Article'),
      description: 'Created by an autotest',
      body: 'Article text from an autotest',
      tagList: [],
    };
  }

  /**
   * Set the title. Note: a fixed title is the same in every build —
   * use `unique.title('…')` if articles must not repeat.
   * @example
   * ```ts
   * new ArticleBuilder().withTitle(unique.title('Promo')).build();
   * ```
   */
  withTitle(title: string): this {
    return this.with('title', title);
  }

  /**
   * Set the short description shown in article lists.
   * @example
   * ```ts
   * new ArticleBuilder().withDescription('Short summary').build();
   * ```
   */
  withDescription(description: string): this {
    return this.with('description', description);
  }

  /**
   * Set the article text.
   * @example
   * ```ts
   * new ArticleBuilder().withBody('Hello, automation!').build();
   * ```
   */
  withBody(body: string): this {
    return this.with('body', body);
  }

  /**
   * Set tags — pass any number of them. Replaces previously set tags.
   * @example
   * ```ts
   * new ArticleBuilder().withTags('news', 'release').build();
   * ```
   */
  withTags(...tags: string[]): this {
    return this.with('tagList', tags);
  }
}
