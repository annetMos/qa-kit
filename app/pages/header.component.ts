import { Locator, Page } from '@playwright/test';

/** Шапка сайта — общая для всех страниц, поэтому компонент, а не страница. */
export class HeaderComponent {
  readonly currentUser: Locator;
  readonly signInLink: Locator;

  constructor(page: Page) {
    const nav = page.getByRole('navigation');
    this.currentUser = nav.getByTestId('current-user');
    this.signInLink = nav.getByRole('link', { name: 'Sign in' });
  }
}
