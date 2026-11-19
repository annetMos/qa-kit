import 'dotenv/config';

/**
 * Environment settings: application URLs and test user credentials.
 *
 * Values are read from `.env` (copy `.env.example` to start). Without `.env`,
 * `playwright.config.ts` fills them in for the built-in demo-app.
 * You rarely need this class in tests — fixtures already use it.
 *
 * @example
 * ```ts
 * const { baseUrl, apiUrl } = EnvConfig.get();
 * ```
 */
export class EnvConfig {
  private static instance: EnvConfig | undefined;

  /** Frontend URL (`BASE_URL`), e.g. `http://localhost:4555`. */
  readonly baseUrl: string;
  /** API base URL (`API_URL`) with a trailing slash, e.g. `http://localhost:4555/api/`. */
  readonly apiUrl: string;
  /** Default test user email (`USER_EMAIL`). */
  readonly userEmail: string;
  /** Default test user password (`USER_PASSWORD`). */
  readonly userPassword: string;

  private constructor() {
    this.baseUrl = EnvConfig.required('BASE_URL');
    this.apiUrl = EnvConfig.required('API_URL');
    this.userEmail = EnvConfig.required('USER_EMAIL');
    this.userPassword = EnvConfig.required('USER_PASSWORD');
  }

  /**
   * Get the settings (created once, then reused).
   * @throws If a required variable is missing — the message says which one.
   */
  static get(): EnvConfig {
    EnvConfig.instance ??= new EnvConfig();
    return EnvConfig.instance;
  }

  private static required(key: string): string {
    const value = process.env[key];
    if (!value) {
      throw new Error(
        `[qa-kit] Environment variable ${key} is not set. ` +
          `Copy .env.example to .env and fill in the value.`,
      );
    }
    return value;
  }
}
