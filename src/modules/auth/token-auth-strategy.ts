import { APIRequestContext } from '@playwright/test';
import { AuthStrategy, Credentials, Session } from './types';

/**
 * Готовая основа для приложений, которые хранят токен в localStorage
 * и передают его в API в заголовке Authorization.
 *
 * Наследнику нужно указать ключ в localStorage и реализовать получение токена.
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
  /** Ключ, под которым фронтенд хранит токен в localStorage. */
  protected abstract readonly storageKey: string;

  /** @param appUrl адрес фронтенда (BASE_URL) — для него запишется localStorage. */
  constructor(protected readonly appUrl: string) {}

  /** Получить токен через API. */
  protected abstract fetchToken(api: APIRequestContext, credentials: Credentials): Promise<string>;

  /** Значение заголовка Authorization. По умолчанию `Bearer <token>`. */
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
