#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function getStagedFiles() {
  try {
    const out = execSync('git diff --cached --name-only --diff-filter=ACM', {
      encoding: 'utf8',
    });
    return out
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
  } catch (err) {
    // If git command fails, fall back to all files
    return [];
  }
}

const patterns = [
  /SUPABASE_SERVICE_ROLE_KEY/,
  /NEXT_PUBLIC_SUPABASE_ANON_KEY/,
  /NEXT_PUBLIC_SUPABASE_URL/,
  /-----BEGIN PRIVATE KEY-----/,
  /AWS_ACCESS_KEY_ID|AKIA[0-9A-Z]{16}/,
  /SECRET[_-]?KEY/i,
  /PASSWORD/i,
  /TOKEN/i,
];

function checkContent(filePath, content) {
  const matches = [];
  patterns.forEach((p) => {
    if (p.test(content)) {
      matches.push(p.toString());
    }
  });
  if (matches.length) {
    return { filePath, matches };
  }
  return null;
}

function run() {
  const staged = getStagedFiles();
  if (staged.length === 0) {
    // No staged files - nothing to check
    process.exit(0);
  }

  const failures = [];
  staged.forEach((file) => {
    try {
      // Only check text files and skip binaries
      const abs = path.resolve(process.cwd(), file);
      if (!fs.existsSync(abs)) return;
      const stat = fs.statSync(abs);
      if (stat.size > 10 * 1024 * 1024) return; // skip very large
      const content = fs.readFileSync(abs, 'utf8');
      const result = checkContent(file, content);
      if (result) failures.push(result);
    } catch (err) {
      // ignore
    }
  });

  if (failures.length) {
    console.error('\nSecret scan FAILED: the following staged files contain potential secrets:');
    failures.forEach((f) => {
      console.error(`\n  - ${f.filePath}`);
      f.matches.forEach((m) => console.error(`      matched: ${m}`));
    });
    console.error('\nTo proceed, remove secrets from the staged files or reset them (git reset <file>) and re-add.');
    process.exit(1);
  }

  process.exit(0);
}

run();
