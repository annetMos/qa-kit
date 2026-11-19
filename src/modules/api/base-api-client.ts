import { APIRequestContext, APIResponse, expect } from '@playwright/test';

/**
 * Base class for the project's API clients.
 * Subclasses describe specific resources (articles, users…);
 * common logic lives here: requests, status checks, readable errors.
 */
export abstract class BaseApiClient {
  protected constructor(protected readonly request: APIRequestContext) {}

  /** GET with a status check; returns parsed JSON. */
  protected async get<T>(url: string, expectedStatus = 200): Promise<T> {
    return this.parse<T>(await this.request.get(url), expectedStatus);
  }

  /** POST with a status check; returns parsed JSON. */
  protected async post<T>(url: string, data: unknown, expectedStatus = 201): Promise<T> {
    return this.parse<T>(await this.request.post(url, { data }), expectedStatus);
  }

  /** PUT with a status check; returns parsed JSON. */
  protected async put<T>(url: string, data: unknown, expectedStatus = 200): Promise<T> {
    return this.parse<T>(await this.request.put(url, { data }), expectedStatus);
  }

  /** DELETE with a status check. */
  protected async delete(url: string, expectedStatus = 204): Promise<void> {
    await this.assertStatus(await this.request.delete(url), expectedStatus);
  }

  private async parse<T>(response: APIResponse, expectedStatus: number): Promise<T> {
    await this.assertStatus(response, expectedStatus);
    return (await response.json()) as T;
  }

  private async assertStatus(response: APIResponse, expectedStatus: number): Promise<void> {
    const body = response.ok() ? '' : `\nResponse body: ${await response.text()}`;
    expect(
      response.status(),
      `[api] ${response.url()} returned ${response.status()}, expected ${expectedStatus}.${body}`,
    ).toBe(expectedStatus);
  }
}
