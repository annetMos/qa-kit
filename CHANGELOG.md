# Changelog

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

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
