import { APIRequestContext } from '@playwright/test';
import { BaseApiClient } from '../../src/modules/api';

type LoginResponse = { user: { email: string; username: string; token: string } };

/**
 * Login API (RealWorld/Conduit). Used by `ConduitAuthStrategy`;
 * tests normally use `test.use({ role })` instead of calling it.
 */
export class AuthApi extends BaseApiClient {
  /** @param request - Unauthenticated request context (`api` fixture). */
  constructor(request: APIRequestContext) {
    super(request);
  }

  /**
   * Log in and get the user's JWT. Expects status 200.
   * @returns The token string.
   */
  async login(email: string, password: string): Promise<string> {
    const body = await this.post<LoginResponse>('users/login', { user: { email, password } }, 200);
    return body.user.token;
  }
}
