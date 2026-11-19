# Changelog

Формат — [Keep a Changelog](https://keepachangelog.com/ru/1.1.0/), версии — [SemVer](https://semver.org/lang/ru/).

## [Unreleased]

## [0.2.0] — 2026-11-19
### Добавлено
- Модуль `auth`: опция `role`, фикстуры `authorizedApi`, `sessions`, `users`, `authStrategy`; вход через API один раз на роль в worker.
- `TokenAuthStrategy` — основа для приложений с токеном в localStorage; пример `ConduitAuthStrategy`.
- demo-app: шапка с текущим пользователем, `GET /api/user`, страница редактора.
- Тесты `auth.spec.ts`: гость, залогиненный пользователь, сценарий «UI → API».
- Page Object `EditorPage` и компонент `HeaderComponent`.

### Изменено
- `articlesApi` использует сессию модуля `auth` вместо собственного входа.

## [0.1.0] — 2026-11-19
### Добавлено
- Ядро: `EnvConfig`, интерфейс `ModuleManifest`.
- Модуль `ui`: `BasePage` для Page Object.
- Модуль `api`: `BaseApiClient`, фикстуры `api` и `cleanup`.
- Команда `npm run features`.
- Встроенный `demo-app` в стиле RealWorld и примеры тестов API + UI.
- CI на GitHub Actions, шаблоны issue и PR, `AGENTS.md`.
