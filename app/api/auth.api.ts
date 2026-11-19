import { APIRequestContext } from '@playwright/test';
import { BaseApiClient } from '../../src/modules/api';

type LoginResponse = { user: { email: string; username: string; token: string } };

/** Авторизация через API (пример для RealWorld/Conduit). */
export class AuthApi extends BaseApiClient {
  constructor(request: APIRequestContext) {
    super(request);
  }

  /** Получить JWT-токен пользователя. */
  async login(email: string, password: string): Promise<string> {
    const body = await this.post<LoginResponse>('users/login', { user: { email, password } }, 200);
    return body.user.token;
  }
}
