#!/usr/bin/env node
const { spawn } = require('child_process');

const port = process.env.PORT || 3000;
const isWin = /^win/.test(process.platform);
const npxCmd = isWin ? 'npx.cmd' : 'npx';

const child = spawn(npxCmd, ['next', 'start', '-p', String(port)], {
  stdio: 'inherit',
  shell: true,
});

child.on('close', (code) => process.exit(code));
child.on('error', (err) => {
  console.error('Failed to start production server', err);
  process.exit(1);
});
