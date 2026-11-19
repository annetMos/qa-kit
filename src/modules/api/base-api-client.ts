import { APIRequestContext, APIResponse, expect } from '@playwright/test';

/**
 * Базовый класс для API-клиентов проекта.
 * Наследники описывают конкретные ресурсы (статьи, пользователи…),
 * а здесь — общая логика: запросы, проверка статуса, понятные ошибки.
 */
export abstract class BaseApiClient {
  protected constructor(protected readonly request: APIRequestContext) {}

  /** GET с проверкой статуса; возвращает распарсенный JSON. */
  protected async get<T>(url: string, expectedStatus = 200): Promise<T> {
    return this.parse<T>(await this.request.get(url), expectedStatus);
  }

  /** POST с проверкой статуса; возвращает распарсенный JSON. */
  protected async post<T>(url: string, data: unknown, expectedStatus = 201): Promise<T> {
    return this.parse<T>(await this.request.post(url, { data }), expectedStatus);
  }

  /** PUT с проверкой статуса; возвращает распарсенный JSON. */
  protected async put<T>(url: string, data: unknown, expectedStatus = 200): Promise<T> {
    return this.parse<T>(await this.request.put(url, { data }), expectedStatus);
  }

  /** DELETE с проверкой статуса. */
  protected async delete(url: string, expectedStatus = 204): Promise<void> {
    await this.assertStatus(await this.request.delete(url), expectedStatus);
  }

  private async parse<T>(response: APIResponse, expectedStatus: number): Promise<T> {
    await this.assertStatus(response, expectedStatus);
    return (await response.json()) as T;
  }

  private async assertStatus(response: APIResponse, expectedStatus: number): Promise<void> {
    const body = response.ok() ? '' : `\nТело ответа: ${await response.text()}`;
    expect(
      response.status(),
      `[api] ${response.url()} вернул ${response.status()}, ожидали ${expectedStatus}.${body}`,
    ).toBe(expectedStatus);
  }
}
