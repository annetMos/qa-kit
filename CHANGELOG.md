# Changelog

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [0.3.0] — 2026-11-19
### Added
- `CookieAuthStrategy` for applications that keep the session in a cookie (incl. HttpOnly); `DemoCookieAuthStrategy` example.
- `BaseApiClient.send()` for requests without a JSON response body.
- demo-app: cookie session login (`POST /api/session`).
- `auth-cookie.spec.ts`: cookie session tests, including a guest test that relies only on `authorizedApi`.
- Beginner guide: `docs/first-test.md` — from a manual test case to an automated test.
- `.vscode/extensions.json` recommending the official Playwright Test for VSCode extension.
- `test-data` module: `Builder<T>` base class and `unique` helpers (`id`, `email`, `title`) safe for parallel runs.
- `ArticleBuilder` example in `app/data/`.

- Hover hints for the whole public API: descriptions, parameters, return values, usage examples and links to the README.
- "Writing hover hints" template in `CONTRIBUTING.md`.

### Fixed
- In tests with a role, the guest `api` fixture could inherit the role's session cookie and become authenticated. `api` and login requests now always start from an empty state.
- `authorizedApi` now carries session cookies, not only headers.

### Changed
- Tests and the beginner guide use builders instead of hard-coded data and `Date.now()`.

## [0.2.0] — 2026-11-19
### Added
- `auth` module: `role` option, `authorizedApi`, `sessions`, `users`, `authStrategy` fixtures; login via API once per role per worker.
- `TokenAuthStrategy` — base for applications that keep a token in localStorage; `ConduitAuthStrategy` example.
- demo-app: header with the current user, `GET /api/user`, editor page.
- `auth.spec.ts` tests: guest, logged-in user, "UI → API" scenario.
- `EditorPage` Page Object and `HeaderComponent`.

### Changed
- `articlesApi` uses the `auth` module session instead of its own login.
- All code, comments, documentation and test names are now in English.

## [0.1.0] — 2026-11-19
### Added
- Core: `EnvConfig`, `ModuleManifest` interface.
- `ui` module: `BasePage` for Page Objects.
- `api` module: `BaseApiClient`, `api` and `cleanup` fixtures.
- `npm run features` command.
- Built-in RealWorld-style `demo-app` and API + UI test examples.
- GitHub Actions CI, issue and PR templates, `AGENTS.md`.
