/**
 * Module descriptor.
 * Every module (ui, api, auth, test-data…) exports a manifest —
 * `npm run features` uses it to show what is enabled and how to use it.
 */
export interface ModuleManifest {
  /** Short module name, e.g. `api`. */
  readonly name: string;
  /** One line: what the module is for. */
  readonly description: string;
  /** Fixtures the module adds to `test` (visible in IDE autocompletion). */
  readonly fixtures: readonly string[];
  /** Usage example shown as a hint for newcomers. */
  readonly example: string;
}
