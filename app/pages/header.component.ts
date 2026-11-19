import { Locator, Page } from '@playwright/test';

/**
 * Site header, shared by all pages — so it is a **component**, not a page:
 * it has no URL of its own and is used on any page.
 *
 * @example
 * ```ts
 * await page.goto('/');
 * await expect(new HeaderComponent(page).currentUser).toHaveText('qa');
 * ```
 */
export class HeaderComponent {
  /** Username of the logged-in user. Absent for guests. */
  readonly currentUser: Locator;
  /** "Sign in" link. Shown to guests only. */
  readonly signInLink: Locator;

  /** @param page - Playwright page from the `page` fixture. */
  constructor(page: Page) {
    const nav = page.getByRole('navigation');
    this.currentUser = nav.getByTestId('current-user');
    this.signInLink = nav.getByRole('link', { name: 'Sign in' });
  }
}
