import { request } from '@playwright/test';
import { AuthStrategy, Credentials, Session, UsersByRole } from './types';

/**
 * Logs in each role **once per worker** and reuses the session in all its tests.
 *
 * Used by the `auth` fixtures — tests normally don't touch it directly.
 * A failed login is not cached, so the next test tries again.
 */
export class SessionManager {
  private readonly cache = new Map<string, Promise<Session>>();

  /**
   * @param strategy - How to log in (from the `authStrategy` fixture).
   * @param users - Credentials by role (from the `users` fixture).
   * @param apiUrl - API base URL used for login requests.
   */
  constructor(
    private readonly strategy: AuthStrategy,
    private readonly users: UsersByRole,
    private readonly apiUrl: string,
  ) {}

  /** Names of all configured roles, e.g. `['user', 'admin']`. */
  get roles(): string[] {
    return Object.keys(this.users);
  }

  /**
   * Default role — the first one in `users`. Used by `authorizedApi` in guest tests.
   * @throws If no users are configured.
   */
  get defaultRole(): string {
    const [first] = this.roles;
    if (!first) {
      throw new Error('[auth] The users list is empty. Define the users fixture in app/fixtures.ts.');
    }
    return first;
  }

  /**
   * Get the session of a role; logs in on first access.
   * @param role - Role name from `users`, e.g. `'admin'`.
   * @throws If the role is unknown — the message lists available roles.
   */
  session(role: string): Promise<Session> {
    const credentials = this.users[role];
    if (!credentials) {
      throw new Error(
        `[auth] Unknown role "${role}". Available roles: ${this.roles.join(', ') || 'none'}. ` +
          `Roles are defined by the users fixture in app/fixtures.ts.`,
      );
    }

    let session = this.cache.get(role);
    if (!session) {
      session = this.login(role, credentials);
      this.cache.set(role, session);
      // Don't cache a failed login — the next test will try again
      session.catch(() => this.cache.delete(role));
    }
    return session;
  }

  private async login(role: string, credentials: Credentials): Promise<Session> {
    // Explicitly empty: login must start from a clean state, not from another role's cookies
    const api = await request.newContext({ baseURL: this.apiUrl, storageState: { cookies: [], origins: [] } });
    try {
      return await this.strategy.login(api, credentials);
    } catch (error) {
      throw new Error(`[auth] Failed to log in as "${role}" (${credentials.email}): ${(error as Error).message}`);
    } finally {
      await api.dispose();
    }
  }
}
