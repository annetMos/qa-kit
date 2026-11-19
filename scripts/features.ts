import { enabledModules } from '../src/modules/registry';

/** `npm run features` — показать подключённые модули и как ими пользоваться. */
console.log('\nПодключённые модули qa-kit:\n');
for (const module of enabledModules) {
  console.log(`● ${module.name} — ${module.description}`);
  console.log(`  фикстуры: ${module.fixtures.join(', ')}`);
  console.log(`  пример:   ${module.example}\n`);
}
