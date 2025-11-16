#!/usr/bin/env node
const { spawn } = require('child_process');

// Use the PORT env var if set, otherwise default to 3000
const port = process.env.PORT || 3000;

// On windows, npx is often 'npx.cmd' in PATH
const isWin = /^win/.test(process.platform);
const npxCmd = isWin ? 'npx.cmd' : 'npx';

const child = spawn(npxCmd, ['next', 'dev', '-p', String(port)], {
  stdio: 'inherit',
  shell: true,
});

child.on('close', (code) => {
  process.exit(code);
});

child.on('error', (err) => {
  console.error('Failed to start dev server', err);
  process.exit(1);
});
