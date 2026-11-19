import { APIRequestContext, BrowserContext } from '@playwright/test';

/** Login and password of a test user. */
export type Credentials = {
  /** Login email. */
  readonly email: string;
  /** Password. */
  readonly password: string;
};

/**
 * Test users by role. The **first** role is the default one.
 * @example
 * ```ts
 * const users: UsersByRole = {
 *   user: { email: 'qa@example.com', password: '...' },
 *   admin: { email: 'admin@example.com', password: '...' },
 * };
 * ```
 */
export type UsersByRole = Readonly<Record<string, Credentials>>;

/** Browser state: cookies and localStorage (Playwright `storageState` format). */
export type StorageState = Awaited<ReturnType<BrowserContext['storageState']>>;

/** Result of a login: one object authenticates both the browser and API requests. */
export type Session = {
  /** Cookies and localStorage the browser starts with. */
  readonly storageState: StorageState;
  /** Headers added to API requests, e.g. `{ Authorization: 'Bearer …' }`. Empty for cookie sessions. */
  readonly apiHeaders: Readonly<Record<string, string>>;
};

/**
 * Describes **how** to log in to your application via the API.
 *
 * Usually you don't implement this interface directly — extend `TokenAuthStrategy`
 * (token in localStorage) or `CookieAuthStrategy` (session cookie). Plug the strategy in via the `authStrategy` fixture in `app/fixtures.ts`.
 *
 * @see {@link https://github.com/annetMos/qa-kit#authentication-auth-module | README: Authentication}
 */
export interface AuthStrategy {
  /**
   * Log in via the API and return a session for the browser and the API.
   * @param api - Unauthenticated request context for `API_URL`.
   * @param credentials - Login and password of the role being logged in.
   */
  login(api: APIRequestContext, credentials: Credentials): Promise<Session>;
}
