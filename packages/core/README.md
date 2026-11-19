# @qa-kit/core

Modular, beginner-friendly **Playwright + TypeScript** building blocks for checking a feature end to end: **API + UI**.

- **ui** — `BasePage` for Page Objects
- **api** — `BaseApiClient` for typed API clients, `cleanup` that removes test data even when a test fails
- **auth** — log in via the API once per role: `test.use({ role: 'user' })`; token (`TokenAuthStrategy`) and cookie (`CookieAuthStrategy`) sessions
- **test-data** — `Builder` with valid defaults and `unique` values safe for parallel runs

Every public method has hover hints with examples — hover over anything in VS Code.

## Install

```bash
npm i -D @qa-kit/core @playwright/test
npx playwright install chromium
```

Requires Node.js 20+ and `@playwright/test` 1.51+.

## Use

```ts
// app/fixtures.ts — your project's fixtures
import { test as base, BaseApiClient, TokenAuthStrategy } from '@qa-kit/core';

export const test = base.extend({
  authStrategy: [async ({}, use) => use(new MyAppAuth(process.env.BASE_URL!)), { scope: 'worker' }],
});
export { expect } from '@qa-kit/core';
```

```ts
// tests/profile.spec.ts
import { expect, test } from '../app/fixtures';

test.use({ role: 'user' });

test('user sees their profile', async ({ page }) => {
  await page.goto('/profile');
  await expect(page.getByRole('heading')).toHaveText('My profile');
});
```

Run `npx qa-kit features` to see all modules, fixtures and examples.

## Learn more

A complete, runnable example project, the beginner guide "Your first test in 15 minutes" and the full docs live in the repository: **https://github.com/annetMos/qa-kit**

License: MIT
