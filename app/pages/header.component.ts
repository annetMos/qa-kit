import { Locator, Page } from '@playwright/test';

/** Site header — shared by all pages, so it is a component, not a page. */
export class HeaderComponent {
  readonly currentUser: Locator;
  readonly signInLink: Locator;

  constructor(page: Page) {
    const nav = page.getByRole('navigation');
    this.currentUser = nav.getByTestId('current-user');
    this.signInLink = nav.getByRole('link', { name: 'Sign in' });
  }
}
