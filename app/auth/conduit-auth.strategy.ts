import { APIRequestContext } from '@playwright/test';
import { Credentials, TokenAuthStrategy } from '../../src/modules/auth';
import { AuthApi } from '../api/auth.api';

/**
 * Вход в RealWorld/Conduit: токен из POST users/login,
 * фронтенд хранит его в localStorage под ключом `jwtToken`,
 * API ждёт заголовок `Authorization: Token <jwt>`.
 * Ключ localStorage у разных реализаций Conduit может отличаться — сверьте со своим фронтендом.
 */
export class ConduitAuthStrategy extends TokenAuthStrategy {
  protected readonly storageKey = 'jwtToken';

  protected async fetchToken(api: APIRequestContext, credentials: Credentials): Promise<string> {
    return new AuthApi(api).login(credentials.email, credentials.password);
  }

  protected override authorizationHeader(token: string): string {
    return `Token ${token}`;
  }
}
