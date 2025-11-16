#!/usr/bin/env node
/* eslint-disable */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PACKAGE_JSON = path.join(ROOT, 'friendly-city-print-shop', 'package.json');
const PLAYWRIGHT_CONFIG = path.join(ROOT, 'friendly-city-print-shop', 'playwright.config.js');
const CI_DOC = path.join(ROOT, 'docs', 'CI-E2E.md');
const INSTR = path.join(ROOT, 'assistant.instructions.md');

function readJSON(file) {
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}

function readFile(file) {
  if (!fs.existsSync(file)) return null;
  return fs.readFileSync(file, 'utf-8');
}

function writeFile(file, content) {
  fs.writeFileSync(file, content, 'utf-8');
}

function genCI() {
  const pkg = readJSON(PACKAGE_JSON);
  const scripts = pkg.scripts || {};
  const e2eRun = scripts['e2e:run-prod'] || 'npm run e2e:run-prod';

  const content = `CI E2E Setup and Supabase Secrets
=================================

This document describes how to run Playwright E2E in CI and locally.

Run the CI-like e2e locally (production build, start server, run tests):

~~~bash
cd friendly-city-print-shop
npm ci
npm run build
${e2eRun}
~~~

In CI, we provide options to either use a hosted Supabase (set secrets) or run a local Supabase using the Supabase CLI. If you prefer hosted Supabase, add the following secrets to GitHub Secrets (recommended to use a dedicated test project):

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY

  See the repository's playwright workflow for conditional handling of hosted vs local Supabase.
`;

  writeFile(CI_DOC, content);
  console.log('Updated', CI_DOC);
}

function genInstr() {
  const pkg = readJSON(PACKAGE_JSON);
  const scripts = pkg.scripts || {};
  const e2eQuick = 'npm run test:e2e';
  const e2eProd = 'npm run e2e:run-prod';

  const content = `Quickstart
----------

To run Playwright E2E quickly against the dev server:

~~~bash
cd friendly-city-print-shop
npm ci
npm run test:e2e
~~~
To run a full CI-like e2e locally (seed -> production build -> start -> test -> cleanup):

~~~bash
cd friendly-city-print-shop
npm ci
npm run e2e:run-prod
~~~
`;

  writeFile(INSTR, content);
  console.log('Updated', INSTR);
}

function main() {
  genCI();
  genInstr();
}

main();
