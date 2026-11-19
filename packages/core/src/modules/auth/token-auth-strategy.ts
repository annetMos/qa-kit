import { APIRequestContext } from '@playwright/test';
import { AuthStrategy, Credentials, Session } from './types';

/**
 * Login strategy for applications that keep an access token in **localStorage**
 * and send it to the API in the `Authorization` header (the most common SPA setup).
 *
 * You write two things: the localStorage key and how to get a token.
 * The class puts the token into the browser's localStorage and into API headers.
 *
 * How to find the key: log in manually, open DevTools → Application → Local Storage
 * and look for the entry with the token.
 *
 * @example
 * ```ts
 * export class MyAppAuth extends TokenAuthStrategy {
 *   protected readonly storageKey = 'accessToken';
 *
 *   protected async fetchToken(api: APIRequestContext, { email, password }: Credentials) {
 *     const response = await api.post('auth/login', { data: { email, password } });
 *     return (await response.json()).accessToken;
 *   }
 * }
 * ```
 * @see {@link https://github.com/annetMos/qa-kit#authentication-auth-module | README: Authentication}
 */
export abstract class TokenAuthStrategy implements AuthStrategy {
  /** localStorage key where the frontend keeps the token (see DevTools → Application). */
  protected abstract readonly storageKey: string;

  /** @param appUrl - Frontend URL (`BASE_URL`); localStorage is written for its origin. */
  constructor(protected readonly appUrl: string) {}

  /**
   * Get an access token via the API (usually a login request).
   * @param api - Unauthenticated request context for `API_URL`.
   * @param credentials - Login and password of the role being logged in.
   * @returns The raw token string.
   */
  protected abstract fetchToken(api: APIRequestContext, credentials: Credentials): Promise<string>;

  /**
   * Build the `Authorization` header value. Default: `Bearer <token>`.
   * Override it if your API expects another format, e.g. `Token <token>`.
   */
  protected authorizationHeader(token: string): string {
    return `Bearer ${token}`;
  }

  /** Called by the framework once per role per worker — you don't need to call it. */
  async login(api: APIRequestContext, credentials: Credentials): Promise<Session> {
    const token = await this.fetchToken(api, credentials);
    return {
      storageState: {
        cookies: [],
        origins: [
          {
            origin: new URL(this.appUrl).origin,
            localStorage: [{ name: this.storageKey, value: token }],
          },
        ],
      },
      apiHeaders: { Authorization: this.authorizationHeader(token) },
    };
  }
}
