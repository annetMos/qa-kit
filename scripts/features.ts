import { enabledModules } from '../src/modules/registry';

/** `npm run features` — show enabled modules and how to use them. */
console.log('\nEnabled qa-kit modules:\n');
for (const module of enabledModules) {
  console.log(`● ${module.name} — ${module.description}`);
  console.log(`  fixtures: ${module.fixtures.join(', ')}`);
  console.log(`  example:  ${module.example}\n`);
}
