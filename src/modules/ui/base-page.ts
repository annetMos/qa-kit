import { Page, expect } from '@playwright/test';

/**
 * Base class for Page Objects — one class per page of your application.
 *
 * A Page Object keeps the page URL and locators in one place, so tests read like
 * test cases and a UI change is fixed in one file instead of every test.
 * A subclass only declares `path` and locators; `open()` and `waitForReady()` come from here.
 *
 * @example
 * ```ts
 * export class SettingsPage extends BasePage {
 *   protected readonly path = '/settings';
 *   readonly saveButton = this.page.getByRole('button', { name: 'Save' });
 * }
 *
 * const settings = await new SettingsPage(page).open();
 * await settings.saveButton.click();
 * ```
 * @see {@link https://github.com/annetMos/qa-kit/blob/main/docs/first-test.md | Guide: your first test}
 */
export abstract class BasePage {
  /** Page path relative to `BASE_URL`, e.g. `/editor` or `/article/my-slug`. */
  protected abstract readonly path: string;

  /** @param page - Playwright page (browser tab) — take it from the `page` fixture. */
  constructor(protected readonly page: Page) {}

  /**
   * Navigate to the page and wait until it is open.
   * @returns The same Page Object, so you can write `const p = await new MyPage(page).open();`
   * @example
   * ```ts
   * const editor = await new EditorPage(page).open();
   * ```
   */
  async open(): Promise<this> {
    await this.page.goto(this.path);
    await this.waitForReady();
    return this;
  }

  /**
   * Check that the browser is on this page (by URL path). Waits and retries automatically.
   * Use it after an action that navigates here, e.g. after submitting a form.
   * @throws If another page is open — the error names the expected Page Object and path.
   */
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
