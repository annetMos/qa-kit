import { request } from '@playwright/test';
import { AuthStrategy, Credentials, Session, UsersByRole } from './types';

/**
 * Keeps sessions by role within a single worker:
 * each role logs in once, then the session is reused.
 */
export class SessionManager {
  private readonly cache = new Map<string, Promise<Session>>();

  constructor(
    private readonly strategy: AuthStrategy,
    private readonly users: UsersByRole,
    private readonly apiUrl: string,
  ) {}

  /** All available roles. */
  get roles(): string[] {
    return Object.keys(this.users);
  }

  /** Default role — the first one in the users list. */
  get defaultRole(): string {
    const [first] = this.roles;
    if (!first) {
      throw new Error('[auth] The users list is empty. Define the users fixture in app/fixtures.ts.');
    }
    return first;
  }

  /** Get a session for the role (logs in on first access). */
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
    const api = await request.newContext({ baseURL: this.apiUrl });
    try {
      return await this.strategy.login(api, credentials);
    } catch (error) {
      throw new Error(`[auth] Failed to log in as "${role}" (${credentials.email}): ${(error as Error).message}`);
    } finally {
      await api.dispose();
    }
  }
}
