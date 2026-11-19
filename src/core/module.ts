/**
 * Описание модуля фреймворка.
 * Каждый модуль (ui, api, auth, test-data…) экспортирует свой manifest —
 * по нему команда `npm run features` показывает, что подключено и что умеет.
 */
export interface ModuleManifest {
  /** Короткое имя модуля, например `api`. */
  readonly name: string;
  /** Одна строка: зачем нужен модуль. */
  readonly description: string;
  /** Фикстуры, которые модуль добавляет в `test` (видны в автодополнении). */
  readonly fixtures: readonly string[];
  /** Пример использования — показывается новичку в подсказке. */
  readonly example: string;
}
