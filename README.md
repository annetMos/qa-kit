# qa-kit

[![npm](https://img.shields.io/npm/v/@qa-kit/core)](https://www.npmjs.com/package/@qa-kit/core)

Modular **Playwright + TypeScript** building blocks for checking a feature end to end: **API + UI**.
Built for people moving from manual testing into automation: every method has hover hints with examples, and `npx qa-kit features` shows what the framework can do.

qa-kit comes in two parts:
- **`@qa-kit/core`** — an npm package with the framework. Install it into your project and get updates with `npm update`.
- **This repository** — a complete, runnable example project that uses the package, plus the beginner guide.

## Add qa-kit to your project

```bash
npm i -D @qa-kit/core @playwright/test
npx playwright install chromium
npx qa-kit features      # see modules, fixtures and examples
```

Requires Node.js 20+ and `@playwright/test` 1.51+. Then:
1. Create `app/fixtures.ts`: extend `test` from `@qa-kit/core` with your login strategy and API clients — copy [app/fixtures.ts](app/fixtures.ts) from this repo as a starting point.
2. Add API clients (`BaseApiClient`), Page Objects (`BasePage`) and builders (`Builder`) under `app/` — see the examples in [app/](app/).
3. Write tests in `tests/`, importing `test` and `expect` from your `app/fixtures`.
4. Set `BASE_URL`, `API_URL`, `USER_EMAIL`, `USER_PASSWORD` in `.env` (see [.env.example](.env.example)).

## Try the example project

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
| `npm run features` | Show modules and usage examples |
| `npm run demo` | Start the demo-app manually: http://localhost:4555 |
| `npm run typecheck` | Type-check the project |

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
- How to log in to your application is described by a strategy in `app/auth/`. Pick the base class by where your app keeps the session (check DevTools → Application):

| Session is kept in | Extend | You write | Example |
|---|---|---|---|
| localStorage (token) | `TokenAuthStrategy` | the localStorage key and how to get a token | `app/auth/conduit-auth.strategy.ts` |
| a cookie (incl. HttpOnly) | `CookieAuthStrategy` | the login request — the server sets the cookie | `app/auth/demo-cookie-auth.strategy.ts` |

Then plug it into the `authStrategy` fixture in `app/fixtures.ts`.

## Test data (`test-data` module)
Builders create valid objects with defaults, so a test sets only the fields it cares about. Defaults are recalculated on every build, so unique values never repeat — even across parallel workers.

```ts
const article = new ArticleBuilder().withTitle('Release notes').withTags('news').build();
const many = new ArticleBuilder().buildMany(5); // 5 articles, 5 unique titles
```

Need a builder for your own entity? Extend `Builder<T>` and implement `defaults()`; use `unique.id()`, `unique.email()` and `unique.title()` for values that must not repeat.

## Repository structure
```
packages/core/     @qa-kit/core — the npm package
  src/core/          environment config, module interface
  src/modules/ui/    BasePage — base for Page Objects
  src/modules/api/   BaseApiClient, api and cleanup fixtures
  src/modules/auth/  role-based login: TokenAuthStrategy, CookieAuthStrategy, SessionManager
  src/modules/test-data/  Builder base class and unique value helpers
  src/index.ts       public API
app/               example project code (clients, pages, builders, fixtures) — uses @qa-kit/core
tests/             example scenarios
demo-app/          built-in application for examples and CI
docs/              guides
AGENTS.md          guidelines for AI agents
```

## Modules
`test` from `@qa-kit/core` includes all modules. To use only some of them, compose your own `test`:

```ts
import { mergeTests } from '@playwright/test';
import { apiTest, testDataTest, uiTest } from '@qa-kit/core';

export const test = mergeTests(uiTest, apiTest, testDataTest); // no auth module
```

If your code uses fixtures of a module you removed (e.g. `authorizedApi`), TypeScript points to every place to update.

| Module | Status | What it provides |
|---|---|---|
| `ui` | ✅ | `BasePage` for Page Objects |
| `api` | ✅ | `BaseApiClient`, `api`, `cleanup` |
| `auth` | ✅ | login via API once per role (token or cookie session); browser and API already authenticated |
| `test-data` | ✅ | builders with valid defaults, unique values safe for parallel runs |
| `reporting` | 🗓 planned | Allure |

## AI agents
`AGENTS.md` describes the architecture and rules so that Claude Code, Copilot or Playwright agents write tests through the project's Page Objects and API clients.

## Contributing
See [CONTRIBUTING.md](CONTRIBUTING.md). License — [MIT](LICENSE).
