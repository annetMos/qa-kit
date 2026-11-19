import { request } from '@playwright/test';
import { AuthStrategy, Credentials, Session, UsersByRole } from './types';

/**
 * Хранит сессии по ролям внутри одного worker:
 * вход для каждой роли выполняется один раз, дальше сессия переиспользуется.
 */
export class SessionManager {
  private readonly cache = new Map<string, Promise<Session>>();

  constructor(
    private readonly strategy: AuthStrategy,
    private readonly users: UsersByRole,
    private readonly apiUrl: string,
  ) {}

  /** Все доступные роли. */
  get roles(): string[] {
    return Object.keys(this.users);
  }

  /** Роль по умолчанию — первая в списке пользователей. */
  get defaultRole(): string {
    const [first] = this.roles;
    if (!first) {
      throw new Error('[auth] Список пользователей пуст. Задайте фикстуру users в app/fixtures.ts.');
    }
    return first;
  }

  /** Получить сессию роли (при первом обращении — войти). */
  session(role: string): Promise<Session> {
    const credentials = this.users[role];
    if (!credentials) {
      throw new Error(
        `[auth] Неизвестная роль "${role}". Доступные роли: ${this.roles.join(', ') || 'нет'}. ` +
          `Роли задаются фикстурой users в app/fixtures.ts.`,
      );
    }

    let session = this.cache.get(role);
    if (!session) {
      session = this.login(role, credentials);
      this.cache.set(role, session);
      // Неудачный вход не кэшируем — следующий тест попробует снова
      session.catch(() => this.cache.delete(role));
    }
    return session;
  }

  private async login(role: string, credentials: Credentials): Promise<Session> {
    const api = await request.newContext({ baseURL: this.apiUrl });
    try {
      return await this.strategy.login(api, credentials);
    } catch (error) {
      throw new Error(`[auth] Не удалось войти под ролью "${role}" (${credentials.email}): ${(error as Error).message}`);
    } finally {
      await api.dispose();
    }
  }
}
