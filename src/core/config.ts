import 'dotenv/config';

/**
 * Single access point to environment settings.
 * Values come from `.env` (see `.env.example`).
 */
export class EnvConfig {
  private static instance: EnvConfig | undefined;

  readonly baseUrl: string;
  readonly apiUrl: string;
  readonly userEmail: string;
  readonly userPassword: string;

  private constructor() {
    this.baseUrl = EnvConfig.required('BASE_URL');
    this.apiUrl = EnvConfig.required('API_URL');
    this.userEmail = EnvConfig.required('USER_EMAIL');
    this.userPassword = EnvConfig.required('USER_PASSWORD');
  }

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
