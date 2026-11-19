import { APIRequestContext } from '@playwright/test';
import { Credentials, TokenAuthStrategy } from '@qa-kit/core';
import { AuthApi } from '../api/auth.api';

/**
 * Login for RealWorld/Conduit: the token comes from POST users/login,
 * the frontend keeps it in localStorage under `jwtToken`,
 * the API expects the `Authorization: Token <jwt>` header.
 * The localStorage key may differ between Conduit implementations — check your frontend.
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
