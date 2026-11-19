import { Page, expect } from '@playwright/test';

/**
 * Базовый класс Page Object.
 * Наследник задаёт `path` и локаторы, а открывать страницу
 * и проверять, что она загрузилась, умеет базовый класс.
 */
export abstract class BasePage {
  /** Относительный путь страницы, например `/editor`. */
  protected abstract readonly path: string;

  constructor(protected readonly page: Page) {}

  /** Открыть страницу и дождаться её готовности. */
  async open(): Promise<this> {
    await this.page.goto(this.path);
    await this.waitForReady();
    return this;
  }

  /** Проверить, что открыта именно эта страница. */
  async waitForReady(): Promise<void> {
    const expectedPath = BasePage.normalize(this.path);
    await expect(
      this.page,
      `[ui] ожидали страницу ${this.constructor.name} (${this.path})`,
    ).toHaveURL((url) => BasePage.normalize(decodeURIComponent(url.pathname)) === expectedPath);
  }

  /** Убрать завершающий слэш, чтобы `/editor` и `/editor/` считались одним путём. */
  private static normalize(path: string): string {
    return path.length > 1 ? path.replace(/\/+$/, '') : path;
  }
}
