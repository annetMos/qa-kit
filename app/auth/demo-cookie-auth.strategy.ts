import { APIRequestContext } from '@playwright/test';
import { CookieAuthStrategy, Credentials } from '@qa-kit/core';
import { AuthApi } from '../api/auth.api';

/**
 * Cookie-session login for the demo-app: `POST session` sets an HttpOnly `sid` cookie.
 * An example of `CookieAuthStrategy` — copy it for your own cookie-based application.
 */
export class DemoCookieAuthStrategy extends CookieAuthStrategy {
  protected async performLogin(api: APIRequestContext, credentials: Credentials): Promise<void> {
    await new AuthApi(api).startSession(credentials.email, credentials.password);
  }
}
