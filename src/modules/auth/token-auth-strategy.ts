import { APIRequestContext } from '@playwright/test';
import { AuthStrategy, Credentials, Session } from './types';

/**
 * Ready-made base for applications that keep a token in localStorage
 * and send it to the API in the Authorization header.
 *
 * Subclasses specify the localStorage key and implement token retrieval.
 * @example
 * class MyAppAuth extends TokenAuthStrategy {
 *   protected readonly storageKey = 'accessToken';
 *   protected async fetchToken(api, { email, password }) {
 *     const res = await api.post('auth/login', { data: { email, password } });
 *     return (await res.json()).accessToken;
 *   }
 * }
 */
export abstract class TokenAuthStrategy implements AuthStrategy {
  /** Key under which the frontend stores the token in localStorage. */
  protected abstract readonly storageKey: string;

  /** @param appUrl frontend URL (BASE_URL) — localStorage is written for this origin. */
  constructor(protected readonly appUrl: string) {}

  /** Get a token via the API. */
  protected abstract fetchToken(api: APIRequestContext, credentials: Credentials): Promise<string>;

  /** Authorization header value. Defaults to `Bearer <token>`. */
  protected authorizationHeader(token: string): string {
    return `Bearer ${token}`;
  }

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
