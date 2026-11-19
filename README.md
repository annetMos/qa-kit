# qa-kit

Модульный каркас автотестов на **Playwright + TypeScript** для проверки фичи целиком: **API + UI**.
Рассчитан на тех, кто переходит из ручного тестирования в автоматизацию: возможности видны из автодополнения и команды `npm run features`, лишние модули отключаются одной строкой.

## Быстрый старт

Нужен Node.js 20+.

```bash
git clone <ссылка на репозиторий>
cd qa-kit
npm install
npx playwright install chromium
npm test
```

Без `.env` тесты запускаются против встроенного **demo-app** (мини-версия RealWorld/Conduit) — Playwright поднимает его сам.

| Команда | Что делает |
|---|---|
| `npm test` | Запустить все тесты |
| `npm run test:ui` | Режим UI Playwright: тесты, шаги, time-travel отладка |
| `npm run report` | Открыть HTML-отчёт последнего прогона |
| `npm run features` | Показать подключённые модули и примеры |
| `npm run demo` | Запустить demo-app вручную: http://localhost:4555 |
| `npm run typecheck` | Проверить типы |

## Как подключить своё приложение
1. `cp .env.example .env` и указать адреса своего стенда и тестового пользователя.
2. В `app/api` описать API-клиенты (наследники `BaseApiClient`), в `app/pages` — страницы (наследники `BasePage`).
3. В `app/fixtures.ts` добавить фикстуры с вашими клиентами.
4. Писать сценарии в `tests/`, импортируя `test` и `expect` из `app/fixtures`.

## Пример теста
```ts
test('статья, созданная через API, отображается на странице', async ({ page, articlesApi, cleanup }) => {
  const article = await articlesApi.create({ title: 'Тест', description: '-', body: 'Текст' });
  cleanup.add('статья', () => articlesApi.remove(article.slug)); // удалится после теста, даже если он упал

  const articlePage = await new ArticlePage(page, article.slug).open();
  await expect(articlePage.title).toHaveText(article.title);
});
```

## Структура
```
src/core/          ядро: конфиг окружения, интерфейс модуля
src/modules/ui/    BasePage — основа для Page Object
src/modules/api/   BaseApiClient, фикстуры api и cleanup
src/fixtures.ts    сборка модулей через mergeTests
app/               код под конкретное приложение (клиенты, страницы, фикстуры)
tests/             сценарии
demo-app/          встроенное приложение для примеров и CI
AGENTS.md          правила для AI-агентов
```

## Модули
Подключение и отключение — в `src/fixtures.ts` (`mergeTests(...)`) и `src/modules/registry.ts`.

| Модуль | Статус | Что даёт |
|---|---|---|
| `ui` | ✅ | `BasePage` для Page Object |
| `api` | ✅ | `BaseApiClient`, `api`, `cleanup` |
| `auth` | 🗓 план | вход через API и передача сессии в браузер |
| `test-data` | 🗓 план | генерация тестовых данных |
| `reporting` | 🗓 план | Allure |

## AI-агенты
`AGENTS.md` описывает архитектуру и правила, чтобы Claude Code, Copilot или агенты Playwright писали тесты через Page Object и API-клиенты проекта.

## Участие
См. [CONTRIBUTING.md](CONTRIBUTING.md). Лицензия — [MIT](LICENSE).
