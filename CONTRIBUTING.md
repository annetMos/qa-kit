# Contributing

Thanks for wanting to help! The project is aimed, among others, at people who are just getting into test automation — questions and small PRs are very welcome too.

## Setup
```bash
git clone https://github.com/annetMos/qa-kit.git
cd qa-kit
npm install
npx playwright install chromium
npm run check   # typecheck + tests against the demo-app
```

## Workflow
1. For larger changes, open an issue first so we can agree on the approach.
2. Branch from `main`: `feat/<short>`, `fix/<short>`, `docs/<short>`.
3. Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/): `feat(api): add retry option`.
4. The PR must pass CI. Fill in the checklist in the PR template.

## Code principles
- All code, comments, docs and test names are in English.
- TypeScript in strict mode, no `any`.
- OOP: base classes define shared behavior (`BasePage`, `BaseApiClient`), subclasses add only their own. One class — one responsibility.
- Modules don't depend on each other; the core knows nothing about specific modules.
- Every public method has JSDoc: what it does and a short example. These are the IDE hints for newcomers.
- Error messages are human-readable: what went wrong and what to do.

## Adding a module
1. Create `src/modules/<name>/` with an `index.ts` that exports `test` (fixtures) and `<name>Manifest`.
2. Plug `test` into `src/fixtures.ts` via `mergeTests`.
3. Add the manifest to `src/modules/registry.ts`.
4. Add a usage example in `tests/` and a section in `README.md`.
