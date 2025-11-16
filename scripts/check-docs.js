#!/usr/bin/env node
/* eslint-disable */
const child = require('child_process');
const path = require('path');

try {
  require(path.resolve(__dirname, 'gen-docs.js'));
} catch (err) {
  console.error('Failed to generate docs', err);
  process.exit(2);
}

try {
  const out = child.execSync('git status --porcelain docs assistant.instructions.md docs/AGENT.md || true', { encoding: 'utf8' });
  if (out.trim()) {
    console.error('Docs changed; please run `npm run docs:generate` and commit the updates.');
    console.error(out);
    process.exit(1);
  }
  console.log('Docs are up-to-date');
  process.exit(0);
} catch (err) {
  console.error('Error checking git status:', err);
  process.exit(2);
}
