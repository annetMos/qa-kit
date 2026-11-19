# Your first test in 15 minutes

This guide is for people moving from manual testing to automation. You will take a manual test case you already know how to write and turn it into an automated qa-kit test — no prior Playwright experience needed.

## Before you start (5 minutes)

1. Install [Node.js](https://nodejs.org/) 20 or newer and [VS Code](https://code.visualstudio.com/).
2. Clone the project and install dependencies:
   ```bash
   git clone https://github.com/annetMos/qa-kit.git
   cd qa-kit
   npm install
   npx playwright install chromium
   ```
3. Open the `qa-kit` folder in VS Code. It will suggest installing the recommended **Playwright Test for VSCode** extension — accept it.
4. Make sure everything works:
   ```bash
   npm test
   ```
   You should see all tests pass. The tests run against the built-in **demo-app**, so you don't need any test environment.

> Tip: run `npm run demo` and open http://localhost:4555 to click through the demo-app manually. Run `npm run features` to see what the framework can do.

## Step 1. Start from a manual test case

Here is a test case you could write by hand:

| | |
|---|---|
| **Title** | Deleted article is no longer available |
| **Precondition** | An article exists |
| **Steps** | 1. Delete the article. 2. Open the article page. |
| **Expected result** | The page says "Article not found". |

## Step 2. Map it to qa-kit

Every part of a manual test case has a place in an automated test:

| Manual test case | qa-kit | Why |
|---|---|---|
| Precondition | API client (`articlesApi`) | Preparing data through the API is fast and stable |
| Cleanup after the test | `cleanup.add(...)` | Test data is removed even if the test fails |
| Steps in the UI | Page Object (`ArticlePage`) | Locators live in one place, tests stay readable |
| Expected result | `expect(...)` | Playwright waits and retries until the check passes |
| Logged-in user | `test.use({ role: 'user' })` | No UI login in every test |

## Step 3. Create the test file

Create `tests/my-first.spec.ts`. Always import `test` and `expect` from `app/fixtures` — this gives you all framework features:

```ts
import { expect, test } from '../app/fixtures';
import { ArticlePage } from '../app/pages/article.page';
```

## Step 4. Write the test

```ts
test('deleted article is no longer available', async ({ page, articlesApi }) => {
  // Precondition: an article exists
  const article = await test.step('Create an article via API', async () => {
    return articlesApi.create({
      title: `First test ${Date.now()}`,
      description: 'My first automated test',
      body: 'Hello, automation!',
    });
  });

  // Step 1: delete the article
  await test.step('Delete the article via API', async () => {
    await articlesApi.remove(article.slug);
  });

  // Step 2 + expected result
  await test.step('Open the article page and check the message', async () => {
    const articlePage = await new ArticlePage(page, article.slug).open();
    await expect(articlePage.title).toHaveText('Article not found');
  });
});
```

What is happening here:
- `async ({ page, articlesApi }) => …` — the test asks for **fixtures**: ready-made objects the framework prepares for you. `page` is a browser tab, `articlesApi` is an authenticated API client. Type `async ({ ` and press `Ctrl+Space` in VS Code to see all available fixtures.
- `test.step(...)` — names a step. Steps show up in reports, so a failed test reads like a manual test case.
- `Date.now()` makes the title unique, so tests don't interfere with each other.
- We don't use `cleanup.add(...)` here because deleting the article *is* part of the test. In most tests you register cleanup right after creating data:
  ```ts
  cleanup.add(`article ${article.slug}`, () => articlesApi.remove(article.slug));
  ```

## Step 5. Run it

Any of these works:
- **VS Code:** click the green ▶ next to the test.
- **Terminal:** `npx playwright test my-first`
- **UI mode:** `npm run test:ui` — shows every step with a screenshot. Great for learning.

## Step 6. When a test fails

Let's break it on purpose. Change the expected text to `'Article found'` and run the test again. You will see:
- the **expected** and **received** values;
- the **line** where the check failed;
- a **screenshot** and a **trace** in `test-results/`.

Open the trace to replay the test step by step:
```bash
npx playwright show-trace test-results/<test-folder>/trace.zip
```
Or open the HTML report: `npm run report`.

Put the correct text back before moving on.

## Good habits checklist

- [ ] Prepare data via the API, check the result in the UI (or the other way around).
- [ ] Register `cleanup.add(...)` for everything you create.
- [ ] No locators in tests — add them to a Page Object in `app/pages`.
- [ ] No `waitForTimeout` — `expect(...)` already waits.
- [ ] One test checks one thing; its title says what.
- [ ] Use `test.step` so reports read like test cases.

## What's next

- Add a locator to a Page Object: open `app/pages/article.page.ts` and see how `title` and `body` are defined.
- Write a test for a logged-in user: see `tests/auth.spec.ts` and `test.use({ role: 'user' })`.
- Connect your own application: see "Using it with your application" in the [README](../README.md).
