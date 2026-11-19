# Guidelines for AI agents (Claude Code, Copilot, Playwright agents)

This project is qa-kit, a Playwright + TypeScript test automation framework. Tests check a feature end to end: API + UI.

## Architecture
- `packages/core` — the `@qa-kit/core` npm package (framework). Contains no project-specific logic.
  - `src/modules/<name>` — modules; each exports `test` with fixtures and a `manifest`.
  - `src/index.ts` — public API. Project code imports **only** from `'@qa-kit/core'`, never from package internals.
- `app/` — code for the application under test: API clients (`app/api`), Page Objects (`app/pages`), data builders (`app/data`), login strategy (`app/auth`), project fixtures (`app/fixtures.ts`).
- `tests/` — scenarios only. Tests import `test`/`expect` from `app/fixtures`.
- `demo-app/` — built-in application for examples and CI. Without `.env`, tests run against it.

## Rules for writing tests
1. Everything is in English: code, comments, test names, step names, error messages.
2. Set up data via API clients from `app/api`, not via the UI. Build request data with builders from `app/data` (subclasses of `Builder<T>`); never hard-code titles or use `Date.now()`.
3. Register every created entity with `cleanup.add(...)`.
4. No raw locators in tests — only Page Objects from `app/pages` (subclasses of `BasePage`).
5. A new API resource means a new `BaseApiClient` subclass — one class per resource.
6. Use `test.step` with clear step names.
7. Locators: `getByRole` / `getByLabel` / `getByTestId`; CSS only as a last resort.
8. No `waitForTimeout` — only web-first assertions `expect(...)`.
9. For logged-in scenarios use `test.use({ role: '<role>' })`, not a UI login. A new application gets its own strategy in `app/auth/`: `TokenAuthStrategy` for a token in localStorage, `CookieAuthStrategy` for a session cookie.
10. Shared page parts (header, menu) are separate components in `app/pages/*.component.ts`.
11. Run `npm run typecheck` after changes.
