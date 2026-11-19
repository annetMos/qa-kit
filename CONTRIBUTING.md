# Contributing

Thanks for wanting to help! The project is aimed, among others, at people who are just getting into test automation — questions and small PRs are very welcome too.

## Setup
```bash
git clone https://github.com/annetMos/qa-kit.git
cd qa-kit
npm install
npx playwright install chromium
npm run check   # builds @qa-kit/core, then typecheck + tests against the demo-app
```

The repo is an npm workspace: the framework lives in `packages/core` (published as `@qa-kit/core`), and the root is an example project that consumes it exactly like users do. Root scripts rebuild the package before tests, so changes in `packages/core/src` are picked up automatically.

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
- Every public class, method, fixture and locator has JSDoc — these are the hover hints newcomers rely on. See [Writing hover hints](#writing-hover-hints).
- Error messages are human-readable: what went wrong and what to do.

## Writing hover hints
When someone hovers over a method in VS Code, they should understand it without opening the docs. Use this template:

````ts
/**
 * What it does — one line, in plain words.
 *
 * When to use it, what to watch out for (optional, 1–3 lines).
 *
 * @param name - What to pass, with a typical value.
 * @returns What comes back (skip for `void`).
 * @throws When it fails, if the error is something the user may hit.
 * @example
 * ```ts
 * // a short, real usage from a test
 * ```
 * @see {@link https://github.com/annetMos/qa-kit#section | README: Section} (optional)
 */
````

Tips:
- Write for someone coming from manual testing: avoid jargon or explain it in a few words.
- Wrap examples in a ` ```ts ` block — VS Code highlights them in the hint.
- Document fixtures on their type (e.g. `ApiFixtures`) — that's what shows up when hovering over a test argument.
- Locators get a one-line comment: which element it is and when it is visible.

## Adding a module
1. Create `packages/core/src/modules/<name>/` with an `index.ts` that exports `test` (fixtures) and `<name>Manifest`.
2. Plug `test` into `packages/core/src/fixtures.ts` via `mergeTests`.
3. Add the manifest to `packages/core/src/registry.ts`.
4. Export the public API from `packages/core/src/index.ts` (the module's `test` as `<name>Test`).
5. Add a usage example in `tests/` and a section in `README.md`.

## Releasing
1. Bump `version` in `packages/core/package.json` and the root `package.json`, update `CHANGELOG.md`.
2. Commit, then push a tag: `git tag -a v0.5.0 -m "v0.5.0" && git push origin v0.5.0`.
3. The `Release` workflow runs the checks and **stages** `@qa-kit/core` on npm via
   [Trusted Publishing](https://docs.npmjs.com/trusted-publishers) (OIDC) — no npm token is stored in the repo.
   If the version is already on npm, this step is skipped.
4. A maintainer approves the release with 2FA: npmjs.com → **Staged Packages** → **Approve**,
   or `npm stage list` and `npm stage approve <stage-id>`. Only then the version becomes installable.
