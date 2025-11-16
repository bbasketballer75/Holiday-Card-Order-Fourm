#!/usr/bin/env node
const { spawn } = require('child_process');

const port = process.env.PORT || 3000;
const nodeExec = process.execPath || 'node';
const nextBin = require('path').join(__dirname, '..', 'node_modules', 'next', 'dist', 'bin', 'next');

const child = spawn(nodeExec, [nextBin, 'start', '-p', String(port)], {
  stdio: 'inherit',
  shell: false,
});

child.on('close', (code) => process.exit(code));
child.on('error', (err) => {
  console.error('Failed to start production server', err);
  process.exit(1);
});
