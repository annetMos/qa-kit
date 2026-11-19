import { APIRequestContext } from '@playwright/test';
import { AuthStrategy, Credentials, Session, StorageState } from './types';

/**
 * Login strategy for applications that keep the session in a **cookie**
 * (classic server-rendered apps, many admin panels, Django/Rails/Laravel backends).
 *
 * You write only the login request. The server answers with `Set-Cookie`, the cookie is kept
 * in the request context, and this class hands it to the browser and to `authorizedApi`.
 * HttpOnly cookies work too — they never need to be read by the page.
 *
 * How to recognize a cookie session: log in manually, open DevTools → Application → Cookies
 * and look for a session cookie (often `sid`, `sessionid`, `connect.sid`, `PHPSESSID`).
 *
 * Note: the browser receives the cookie only if its domain matches `BASE_URL`.
 * If the API lives on another domain, the backend must set the cookie for the shared parent domain.
 *
 * @example
 * ```ts
 * export class MyAppCookieAuth extends CookieAuthStrategy {
 *   protected async performLogin(api: APIRequestContext, { email, password }: Credentials) {
 *     const response = await api.post('auth/login', { form: { email, password } });
 *     expect(response.ok()).toBeTruthy();
 *   }
 * }
 * ```
 * @see {@link https://github.com/annetMos/qa-kit#authentication-auth-module | README: Authentication}
 */
export abstract class CookieAuthStrategy implements AuthStrategy {
  /**
   * Send the login request. The server must answer with `Set-Cookie` —
   * the cookie is stored in `api` automatically. Check the response status here.
   * @param api - Request context for `API_URL`; it collects the cookies.
   * @param credentials - Login and password of the role being logged in.
   */
  protected abstract performLogin(api: APIRequestContext, credentials: Credentials): Promise<void>;

  /**
   * Extra headers for API requests, e.g. a CSRF token taken from a cookie.
   * Default: none — the cookie alone authenticates requests.
   * @param state - Cookies received after login.
   * @example
   * ```ts
   * protected override apiHeaders(state: StorageState) {
   *   const csrf = state.cookies.find((c) => c.name === 'csrftoken')?.value ?? '';
   *   return { 'X-CSRFToken': csrf };
   * }
   * ```
   */
  protected apiHeaders(_state: StorageState): Record<string, string> {
    return {};
  }

  /** Called by the framework once per role per worker — you don't need to call it. */
  async login(api: APIRequestContext, credentials: Credentials): Promise<Session> {
    await this.performLogin(api, credentials);
    const storageState = await api.storageState();
    if (storageState.cookies.length === 0) {
      throw new Error(
        '[auth] The login request finished, but the server set no cookies. ' +
          'Check the login endpoint, or use TokenAuthStrategy if the app keeps a token in localStorage.',
      );
    }
    return { storageState, apiHeaders: this.apiHeaders(storageState) };
  }
}
