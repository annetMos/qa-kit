/**
 * Base class for test data builders.
 *
 * A builder creates a **valid object with sensible defaults**; a test changes only the fields
 * that matter to it. Tests stay short, and when the data format changes you fix one builder.
 * Defaults are recalculated on every `build()`, so unique values never repeat.
 *
 * A subclass implements `defaults()` and usually adds named methods like `withTitle()`.
 *
 * @example
 * ```ts
 * export class UserBuilder extends Builder<User> {
 *   protected defaults(): User {
 *     return { email: unique.email(), name: 'Test User' };
 *   }
 *
 *   withName(name: string): this {
 *     return this.with('name', name);
 *   }
 * }
 *
 * const user = new UserBuilder().withName('Anna').build();
 * ```
 * @see {@link https://github.com/annetMos/qa-kit#test-data-test-data-module | README: Test data}
 */
export abstract class Builder<T extends object> {
  private overrides: Partial<T> = {};

  /**
   * Valid default values for every field. Called on each `build()` —
   * put `unique.*()` calls here so every object gets fresh unique values.
   */
  protected abstract defaults(): T;

  /**
   * Set any field. Methods can be chained.
   * In tests prefer named methods (`withTitle()` etc.) — they read better.
   * @param key - Field name; autocompletion shows the available fields.
   * @param value - New value; its type is checked against the field.
   * @example
   * ```ts
   * new ArticleBuilder().with('title', 'Release notes').build();
   * ```
   */
  with<K extends keyof T>(key: K, value: T[K]): this {
    this.overrides = { ...this.overrides, [key]: value };
    return this;
  }

  /**
   * Create the object: defaults + everything you set with `with…()` methods.
   * @example
   * ```ts
   * const article = new ArticleBuilder().withTags('news').build();
   * ```
   */
  build(): T {
    return { ...this.defaults(), ...this.overrides };
  }

  /**
   * Create several objects at once. Fields you set are shared; defaults
   * (including unique values) are generated separately for each object.
   * @param count - How many objects to create.
   * @example
   * ```ts
   * const articles = new ArticleBuilder().withTags('bulk').buildMany(3); // 3 unique titles
   * ```
   */
  buildMany(count: number): T[] {
    return Array.from({ length: count }, () => this.build());
  }
}
