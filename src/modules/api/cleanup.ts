type CleanupTask = { readonly description: string; readonly run: () => Promise<void> };

/**
 * Removes test data after the test — even if the test fails.
 *
 * Right after creating something, register how to remove it. Tasks run after the test
 * in reverse order (last created — first removed), so dependent data is removed safely.
 * A failed cleanup doesn't fail the test; it is reported as a warning.
 *
 * @example
 * ```ts
 * const article = await articlesApi.create(new ArticleBuilder().build());
 * cleanup.add(`article ${article.slug}`, () => articlesApi.remove(article.slug));
 * ```
 */
export class CleanupRegistry {
  private readonly tasks: CleanupTask[] = [];

  /**
   * Register a removal action to run after the test.
   * @param description - What is removed — shown in the warning if removal fails.
   * @param run - Async function that removes the data, usually an API client call.
   * @example
   * ```ts
   * cleanup.add('user anna', () => usersApi.remove(user.id));
   * ```
   */
  add(description: string, run: () => Promise<void>): void {
    this.tasks.push({ description, run });
  }

  /** Run all registered tasks. Called by the framework — you don't need to call it. */
  async runAll(): Promise<void> {
    const errors: string[] = [];
    for (const task of [...this.tasks].reverse()) {
      try {
        await task.run();
      } catch (error) {
        errors.push(`${task.description}: ${(error as Error).message}`);
      }
    }
    this.tasks.length = 0;
    if (errors.length > 0) {
      console.warn(`[cleanup] Failed to clean up:\n- ${errors.join('\n- ')}`);
    }
  }
}
