import { Page, expect } from '@playwright/test';

/**
 * Base Page Object.
 * Subclasses define `path` and locators; opening the page
 * and checking that it has loaded is handled here.
 */
export abstract class BasePage {
  /** Relative page path, e.g. `/editor`. */
  protected abstract readonly path: string;

  constructor(protected readonly page: Page) {}

  /** Open the page and wait until it is ready. */
  async open(): Promise<this> {
    await this.page.goto(this.path);
    await this.waitForReady();
    return this;
  }

  /** Assert that this exact page is open. */
  async waitForReady(): Promise<void> {
    const expectedPath = BasePage.normalize(this.path);
    await expect(
      this.page,
      `[ui] expected page ${this.constructor.name} (${this.path})`,
    ).toHaveURL((url) => BasePage.normalize(decodeURIComponent(url.pathname)) === expectedPath);
  }

  /** Strip the trailing slash so `/editor` and `/editor/` are treated as the same path. */
  private static normalize(path: string): string {
    return path.length > 1 ? path.replace(/\/+$/, '') : path;
  }
}
