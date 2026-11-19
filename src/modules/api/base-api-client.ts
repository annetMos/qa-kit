import { APIRequestContext, APIResponse, expect } from '@playwright/test';

/**
 * Base class for API clients — one class per API resource (articles, users, orders…).
 *
 * Subclasses expose readable methods like `create()` or `remove()`; this class does the
 * routine work: sends the request, checks the status code and parses JSON.
 * A wrong status fails the test with the URL, the status and the response body.
 *
 * @example
 * ```ts
 * export class UsersApi extends BaseApiClient {
 *   constructor(request: APIRequestContext) {
 *     super(request);
 *   }
 *   async getById(id: string): Promise<User> {
 *     return this.get<User>(`users/${id}`);
 *   }
 * }
 * ```
 */
export abstract class BaseApiClient {
  /** @param request - Request context: `api` (guest) or `authorizedApi` (logged in) fixture. */
  protected constructor(protected readonly request: APIRequestContext) {}

  /**
   * Send GET and return the parsed JSON body.
   * @param url - Path relative to `API_URL`, without a leading slash: `articles/my-slug`.
   * @param expectedStatus - Status code the request must return. Default: `200`.
   */
  protected async get<T>(url: string, expectedStatus = 200): Promise<T> {
    return this.parse<T>(await this.request.get(url), expectedStatus);
  }

  /**
   * Send POST with a JSON body and return the parsed JSON response.
   * @param url - Path relative to `API_URL`, without a leading slash.
   * @param data - Request body, sent as JSON.
   * @param expectedStatus - Status code the request must return. Default: `201`.
   */
  protected async post<T>(url: string, data: unknown, expectedStatus = 201): Promise<T> {
    return this.parse<T>(await this.request.post(url, { data }), expectedStatus);
  }

  /**
   * Send PUT with a JSON body and return the parsed JSON response.
   * @param url - Path relative to `API_URL`, without a leading slash.
   * @param data - Request body, sent as JSON.
   * @param expectedStatus - Status code the request must return. Default: `200`.
   */
  protected async put<T>(url: string, data: unknown, expectedStatus = 200): Promise<T> {
    return this.parse<T>(await this.request.put(url, { data }), expectedStatus);
  }

  /**
   * Send DELETE.
   * @param url - Path relative to `API_URL`, without a leading slash.
   * @param expectedStatus - Status code the request must return. Default: `204`.
   */
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
