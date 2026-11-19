import { EnvConfig } from '../src/core/config';
import { test as base } from '../src/fixtures';
import { ArticlesApi } from './api/articles.api';
import { ConduitAuthStrategy } from './auth/conduit-auth.strategy';

type AppFixtures = {
  /** Articles API on behalf of the current role (or the default role). */
  articlesApi: ArticlesApi;
};

/**
 * Project-specific `test`: framework fixtures + application settings and clients.
 * This is what tests import.
 */
export const test = base.extend<AppFixtures>({
  // How to log in to this application
  authStrategy: [
    async ({}, use) => {
      await use(new ConduitAuthStrategy(EnvConfig.get().baseUrl));
    },
    { scope: 'worker' },
  ],

  // Add more roles here, e.g. admin: { email: process.env.ADMIN_EMAIL!, password: ... }
  // users: [async ({}, use) => use({ user: {...}, admin: {...} }), { scope: 'worker' }],

  articlesApi: async ({ authorizedApi, cleanup }, use) => {
    await use(new ArticlesApi(authorizedApi));
    // Remove test data first, while the authenticated context is still alive
    await cleanup.runAll();
  },
});

export { expect } from '../src/fixtures';
