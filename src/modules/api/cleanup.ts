type CleanupTask = { readonly description: string; readonly run: () => Promise<void> };

/**
 * Реестр очистки тестовых данных.
 * Создали сущность → зарегистрировали удаление → после теста всё удалится
 * в обратном порядке, даже если тест упал.
 */
export class CleanupRegistry {
  private readonly tasks: CleanupTask[] = [];

  /** Зарегистрировать действие, которое выполнится после теста. */
  add(description: string, run: () => Promise<void>): void {
    this.tasks.push({ description, run });
  }

  /** Вызывается фикстурой автоматически — вручную не нужен. */
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
      console.warn(`[cleanup] Не удалось очистить:\n- ${errors.join('\n- ')}`);
    }
  }
}
