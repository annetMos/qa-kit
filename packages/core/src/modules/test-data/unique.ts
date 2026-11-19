let counter = 0;

/**
 * Process-wide unique suffix: time + process id + counter.
 * Playwright runs each worker in its own process, so values never collide
 * between parallel workers or between calls in the same worker.
 */
function suffix(): string {
  counter += 1;
  return `${Date.now().toString(36)}${process.pid.toString(36)}${counter.toString(36)}`;
}

/**
 * Unique values for test data — safe when tests run in parallel.
 *
 * Use them for fields that must not repeat: titles, emails, usernames, order numbers.
 * Unique data keeps tests independent: they don't see or break each other's data.
 *
 * @example
 * ```ts
 * unique.id('order');      // 'order-mh3k2x1a9b1'
 * unique.email('buyer');   // 'buyer-mh3k2x1a9b2@example.com'
 * unique.title('Promo');   // 'Promo mh3k2x1a9b3'
 * ```
 * @see {@link https://github.com/annetMos/qa-kit#test-data-test-data-module | README: Test data}
 */
export const unique = {
  /**
   * Unique id: `<prefix>-<suffix>`. Good for usernames, codes, slugs.
   * @param prefix - Readable start of the value. Default: `'id'`.
   * @example
   * ```ts
   * unique.id('coupon'); // 'coupon-mh3k2x1a9b1'
   * ```
   */
  id(prefix = 'id'): string {
    return `${prefix}-${suffix()}`;
  },

  /**
   * Unique email: `<prefix>-<suffix>@<domain>`.
   * The default domain `example.com` is reserved and never receives real mail.
   * @param prefix - Part before the suffix. Default: `'user'`.
   * @param domain - Email domain. Default: `'example.com'`.
   * @example
   * ```ts
   * unique.email('buyer'); // 'buyer-mh3k2x1a9b2@example.com'
   * ```
   */
  email(prefix = 'user', domain = 'example.com'): string {
    return `${prefix}-${suffix()}@${domain}`;
  },

  /**
   * Unique human-readable title: `<prefix> <suffix>`. Easy to spot in the UI and in reports.
   * @param prefix - Readable start of the title. Default: `'Test'`.
   * @example
   * ```ts
   * unique.title('Release notes'); // 'Release notes mh3k2x1a9b3'
   * ```
   */
  title(prefix = 'Test'): string {
    return `${prefix} ${suffix()}`;
  },
} as const;
