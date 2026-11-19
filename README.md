# qa-kit

A modular **Playwright + TypeScript** test automation starter for checking a feature end to end: **API + UI**.
Built for people moving from manual testing into automation: capabilities are discoverable through IDE autocompletion and `npm run features`, and unused modules can be switched off with one line.

## Quick start

Requires Node.js 20+.

```bash
git clone https://github.com/annetMos/qa-kit.git
cd qa-kit
npm install
npx playwright install chromium
npm test
```

Without a `.env` file, tests run against the built-in **demo-app** (a mini RealWorld/Conduit clone) — Playwright starts it automatically.

**New to test automation?** Start with [Your first test in 15 minutes](docs/first-test.md).

**Using VS Code?** Open the project and accept the recommended *Playwright Test for VSCode* extension: run and debug tests with the ▶ button, pick locators by clicking on the page.

**Hover over anything** — fixtures, builders, API clients, Page Objects, locators — to see what it does, its parameters and a usage example right in the editor.

| Command | What it does |
|---|---|
| `npm test` | Run all tests |
| `npm run test:ui` | Playwright UI mode: tests, steps, time-travel debugging |
| `npm run report` | Open the HTML report of the last run |
| `npm run features` | Show enabled modules and usage examples |
| `npm run demo` | Start the demo-app manually: http://localhost:4555 |
| `npm run typecheck` | Type-check the project |

## Using it with your application
1. `cp .env.example .env` and set your environment URLs and test user.
2. Describe API clients in `app/api` (subclasses of `BaseApiClient`) and pages in `app/pages` (subclasses of `BasePage`).
3. Plug in your login strategy and clients in `app/fixtures.ts`.
4. Write scenarios in `tests/`, importing `test` and `expect` from `app/fixtures`.

## Test example
```ts
test('article created via API is shown on its page', async ({ page, articlesApi, cleanup }) => {
  const article = await articlesApi.create(new ArticleBuilder().build()); // valid data with a unique title
  cleanup.add('article', () => articlesApi.remove(article.slug)); // removed after the test, even if it fails

  const articlePage = await new ArticlePage(page, article.slug).open();
  await expect(articlePage.title).toHaveText(article.title);
});
```

## Authentication (`auth` module)
A test without a role runs as a guest. To start the browser and the API already logged in, set a role:

```ts
test.describe('User', () => {
  test.use({ role: 'user' });

  test('sees their name in the header', async ({ page }) => {
    await page.goto('/');
    await expect(new HeaderComponent(page).currentUser).toHaveText('qa');
  });
});
```

- Login happens **via the API once per role per worker**, and the session is reused — no UI login in tests.
- `authorizedApi` is an API context with the current role's token.
- Roles are defined by the `users` fixture in `app/fixtures.ts` (by default, a single `user` role from `USER_EMAIL` / `USER_PASSWORD`).
- How to log in to your application is described by a strategy in `app/auth/`. If your frontend keeps a token in localStorage, extend `TokenAuthStrategy` and specify the key and how to get the token (see `ConduitAuthStrategy`).

## Test data (`test-data` module)
Builders create valid objects with defaults, so a test sets only the fields it cares about. Defaults are recalculated on every build, so unique values never repeat — even across parallel workers.

```ts
const article = new ArticleBuilder().withTitle('Release notes').withTags('news').build();
const many = new ArticleBuilder().buildMany(5); // 5 articles, 5 unique titles
```

Need a builder for your own entity? Extend `Builder<T>` and implement `defaults()`; use `unique.id()`, `unique.email()` and `unique.title()` for values that must not repeat.

## Project structure
```
src/core/          core: environment config, module interface
src/modules/ui/    BasePage — base for Page Objects
src/modules/api/   BaseApiClient, api and cleanup fixtures
src/modules/auth/  role-based login: TokenAuthStrategy, SessionManager
src/modules/test-data/  Builder base class and unique value helpers
src/fixtures.ts    module composition via mergeTests
app/               application-specific code (clients, pages, fixtures)
tests/             scenarios
demo-app/          built-in application for examples and CI
AGENTS.md          guidelines for AI agents
```

## Modules
Enable or disable modules in `src/fixtures.ts` (`mergeTests(...)`) and `src/modules/registry.ts`.

| Module | Status | What it provides |
|---|---|---|
| `ui` | ✅ | `BasePage` for Page Objects |
| `api` | ✅ | `BaseApiClient`, `api`, `cleanup` |
| `auth` | ✅ | login via API once per role; browser and API already authenticated |
| `test-data` | ✅ | builders with valid defaults, unique values safe for parallel runs |
| `reporting` | 🗓 planned | Allure |

## AI agents
`AGENTS.md` describes the architecture and rules so that Claude Code, Copilot or Playwright agents write tests through the project's Page Objects and API clients.

## Contributing
See [CONTRIBUTING.md](CONTRIBUTING.md). License — [MIT](LICENSE).
