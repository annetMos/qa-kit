import { APIRequestContext, BrowserContext } from '@playwright/test';

/** Логин и пароль тестового пользователя. */
export type Credentials = { readonly email: string; readonly password: string };

/** Пользователи по ролям, например `{ user: {...}, admin: {...} }`. Первая роль — роль по умолчанию. */
export type UsersByRole = Readonly<Record<string, Credentials>>;

/** Состояние браузера: cookies и localStorage (формат Playwright `storageState`). */
export type StorageState = Awaited<ReturnType<BrowserContext['storageState']>>;

/** Результат входа: чем авторизовать браузер и чем — API-запросы. */
export type Session = {
  readonly storageState: StorageState;
  readonly apiHeaders: Readonly<Record<string, string>>;
};

/**
 * Стратегия входа в конкретное приложение.
 * Реализуйте её в `app/auth/` и подключите в `app/fixtures.ts`.
 */
export interface AuthStrategy {
  /** Войти через API и вернуть сессию для браузера и API. */
  login(api: APIRequestContext, credentials: Credentials): Promise<Session>;
}
