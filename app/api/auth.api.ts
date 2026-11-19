import { APIRequestContext } from '@playwright/test';
import { BaseApiClient } from '../../src/modules/api';

type LoginResponse = { user: { email: string; username: string; token: string } };

/** Authentication via the API (RealWorld/Conduit example). */
export class AuthApi extends BaseApiClient {
  constructor(request: APIRequestContext) {
    super(request);
  }

  /** Get the user's JWT. */
  async login(email: string, password: string): Promise<string> {
    const body = await this.post<LoginResponse>('users/login', { user: { email, password } }, 200);
    return body.user.token;
  }
}
