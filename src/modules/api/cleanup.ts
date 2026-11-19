type CleanupTask = { readonly description: string; readonly run: () => Promise<void> };

/**
 * Test data cleanup registry.
 * Create an entity → register its removal → everything is removed after the test
 * in reverse order, even if the test failed.
 */
export class CleanupRegistry {
  private readonly tasks: CleanupTask[] = [];

  /** Register an action to run after the test. */
  add(description: string, run: () => Promise<void>): void {
    this.tasks.push({ description, run });
  }

  /** Called by the fixture automatically — no need to call it manually. */
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
