#!/usr/bin/env node
/*
  Orchestrates a production E2E run: seed -> build -> spawn production server -> wait for health -> run Playwright tests -> cleanup server.
  This avoids relying on start-server-and-test which may use wmic on older Windows installs.
*/
const { spawn } = require('child_process');
const waitOn = require('wait-on');
const path = require('path');
const fs = require('fs');

const root = path.resolve(__dirname, '..');
const port = process.env.PORT || 3000;
const hostname = process.env.E2E_HOST || '127.0.0.1';
const baseURL = `http://${hostname}:${port}`;

// Build a list of waitOn resources; include IPv6 loopback if not explicitly using IPv6
const waitResources = [baseURL];
if (!hostname.includes('[') && hostname !== '::1') {
  waitResources.push(`http://[::1]:${port}`);
}

let serverProcess;

async function cleanup() {
  try {
    if (serverProcess && !serverProcess.killed) {
      console.log('E2E run: stopping server');
      try {
        process.kill(serverProcess.pid, 'SIGTERM');
      } catch (err) {
        console.warn(
          'E2E run: failed to kill server process by PID, attempting fallback cleanup',
          err.message,
        );
        if (process.platform === 'win32') {
          spawn(
            'powershell',
            [
              '-NoProfile',
              '-WindowStyle',
              'Hidden',
              '-Command',
              `& { Get-NetTCPConnection -LocalPort ${port} | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force } }`,
            ],
            { stdio: 'ignore' },
          );
        } else {
          spawn('bash', ['-lc', `fuser -k ${port}/tcp || true`], { stdio: 'ignore' });
        }
      }
    }
  } catch (err) {
    console.warn('Cleanup error:', err.message);
  }
}

['SIGINT', 'SIGTERM'].forEach((signal) => {
  process.on(signal, async () => {
    await cleanup();
    process.exit(1);
  });
});

process.on('exit', () => {
  if (serverProcess && !serverProcess.killed) {
    try {
      process.kill(serverProcess.pid, 'SIGTERM');
    } catch (_) {
      // ignore
    }
  }
});
=======
const host = process.env.E2E_HOST || '127.0.0.1';
const waitResources = [`http://${host.replace(/\[/g, '').replace(/\]/g, '')}:${port}`];

// When Next.js binds only to IPv6 (::), wait-on will never see the server if it
// probes 127.0.0.1. Provide an IPv6 fallback explicitly so whichever stack is
// available can unlock the tests.
if (!host.includes('[')) {
  waitResources.push(`http://[::1]:${port}`);
}

let serverProcess;
>>>>>>> df07897 (chore(agent): produce consistent workflow and agent-runner updates)

function runScript(command, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const cp = spawn(
      command,
      args,
      Object.assign({ stdio: 'inherit', cwd: root, env: process.env }, opts),
    );
    cp.on('exit', (code) =>
      code === 0 ? resolve(0) : reject(new Error(`Exited with code ${code}`)),
    );
    cp.on('error', (err) => reject(err));
  });
}

async function main() {
  try {
    // Seed first
    console.log('E2E run: seeding data (if configured)');
    try {
      await runScript(process.platform === 'win32' ? 'node' : 'node', ['scripts/e2e-setup.js']);
    } catch (e) {
      console.warn('Seeding failed or skipped:', e.message);
    }

    // Build
    console.log('E2E run: building production');
    await runScript('node', ['node_modules/next/dist/bin/next', 'build']);

    // Start production server directly via node (gives us a handle to the child process)
    console.log('E2E run: starting production server');
    serverProcess = spawn(
      'node',
      ['node_modules/next/dist/bin/next', 'start', '-p', String(port), '-H', hostname],
      { cwd: root, stdio: 'inherit', env: process.env },
    );

    // Wait for the server to respond
    console.log(`E2E run: waiting for ${baseURL} to be ready (timeout 120000ms)`);
    await waitOn({ resources: waitResources, timeout: 120000 });
    console.log('E2E run: server is ready, running Playwright tests');

    try {
      // Run Playwright tests via package: avoid spawning npx to reduce powershell issues
      // Use the Playwright CLI entry point, explicitly request an HTML reporter to ensure
      // the CI runner consistently generates the playwright-report folder.
      await runScript('node', [
        path.join('node_modules', '@playwright', 'test', 'cli.js'),
        'test',
        '--reporter=html',
      ]);
    } catch (err) {
      console.error('E2E tests failed:', err.message);
      await cleanup();
      process.exit(1);
    }

    // Cleanup
    await cleanup();
    // Run e2e-cleanup local step
    try {
      await runScript('node', ['scripts/e2e-cleanup.js']);
    } catch (err) {
      console.warn('E2E seed cleanup error:', err.message);
    }

    console.log('E2E run complete');
    process.exit(0);
  } catch (err) {
    console.error('E2E run error:', err);
    await cleanup();
    process.exit(1);
  }
}

main();
