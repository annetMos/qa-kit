#!/usr/bin/env node
import { modules } from './registry';

const HELP = `qa-kit — helpers for @qa-kit/core

Usage:
  npx qa-kit features   Show available modules, their fixtures and examples
  npx qa-kit help       Show this help
`;

function printFeatures(): void {
  console.log('\nqa-kit modules:\n');
  for (const module of modules) {
    console.log(`● ${module.name} — ${module.description}`);
    console.log(`  fixtures: ${module.fixtures.join(', ')}`);
    console.log(`  example:  ${module.example}\n`);
  }
}

const [command = 'help'] = process.argv.slice(2);
if (command === 'features') {
  printFeatures();
} else {
  console.log(HELP);
  if (command !== 'help') process.exitCode = 1;
}
