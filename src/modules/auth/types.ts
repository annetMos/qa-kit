import { APIRequestContext, BrowserContext } from '@playwright/test';

/** Test user login and password. */
export type Credentials = { readonly email: string; readonly password: string };

/** Users by role, e.g. `{ user: {...}, admin: {...} }`. The first role is the default one. */
export type UsersByRole = Readonly<Record<string, Credentials>>;

/** Browser state: cookies and localStorage (Playwright `storageState` format). */
export type StorageState = Awaited<ReturnType<BrowserContext['storageState']>>;

/** Login result: what authenticates the browser and what authenticates API requests. */
export type Session = {
  readonly storageState: StorageState;
  readonly apiHeaders: Readonly<Record<string, string>>;
};

/**
 * Login strategy for a specific application.
 * Implement it in `app/auth/` and plug it in via `app/fixtures.ts`.
 */
export interface AuthStrategy {
  /** Log in via the API and return a session for the browser and the API. */
  login(api: APIRequestContext, credentials: Credentials): Promise<Session>;
}
