#!/usr/bin/env node
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const waitOn = require('wait-on');

const projectRoot = path.join(__dirname, '..');
const nodeExec = process.execPath || 'node';
const port = Number(process.env.LIGHTHOUSE_PORT || process.env.PORT || 3000);
const host = process.env.LIGHTHOUSE_HOST || '127.0.0.1';
const url = process.env.LIGHTHOUSE_URL || `http://${host}:${port}`;
const waitTimeoutMs = Number(process.env.LIGHTHOUSE_WAIT_MS || 120000);
const preset = process.env.LIGHTHOUSE_PRESET || 'desktop';
const chromeFlags =
    process.env.LIGHTHOUSE_CHROME_FLAGS || '--headless=new --no-sandbox --disable-dev-shm-usage';
const outputDir = path.join(projectRoot, 'test-results', 'lighthouse');
const timestamp = new Date().toISOString().split('.')[0].replace(/[:]/g, '-');
const baseReportPath = path.join(outputDir, `lighthouse-report-${timestamp}`);
const jsonReportPath = `${baseReportPath}.report.json`;
const htmlReportPath = `${baseReportPath}.report.html`;

let serverProcess;

async function runCommand(command, args, options = {}) {
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, {
            stdio: 'inherit',
            shell: false,
            ...options,
        });

        child.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`${command} ${args.join(' ')} exited with code ${code}`));
            }
        });

        child.on('error', reject);
    });
}

async function runNextBuild() {
    const nextBin = path.join(
        projectRoot,
        'node_modules',
        'next',
        'dist',
        'bin',
        'next',
    );

    await runCommand(nodeExec, [nextBin, 'build'], { cwd: projectRoot });
}

function startServer() {
    const server = spawn(nodeExec, [path.join(__dirname, 'start.js')], {
        cwd: projectRoot,
        env: { ...process.env, PORT: String(port) },
        stdio: 'inherit',
        shell: false,
    });

    server.on('error', (err) => {
        console.error('Failed to start production server for Lighthouse', err);
        process.exit(1);
    });

    return server;
}

function stopServer(child, signal = 'SIGINT') {
    if (!child || child.killed) {
        return Promise.resolve();
    }

    return new Promise((resolve) => {
        const timeout = setTimeout(() => {
            if (!child.killed) {
                child.kill('SIGKILL');
            }
        }, 5000);

        child.once('exit', () => {
            clearTimeout(timeout);
            resolve();
        });

        child.kill(signal);
    });
}

async function waitForServer() {
    const resource = `http-get://${host}:${port}`;
    await waitOn({ resources: [resource], timeout: waitTimeoutMs });
}

async function runLighthouse() {
    fs.mkdirSync(outputDir, { recursive: true });
    const lighthouseCli = path.join(
        projectRoot,
        'node_modules',
        'lighthouse',
        'cli',
        'index.js',
    );

    const args = [
        lighthouseCli,
        url,
        '--output=json',
        '--output=html',
        `--output-path=${baseReportPath}`,
        `--preset=${preset}`,
        `--chrome-flags=${chromeFlags}`,
        '--quiet',
    ];

    await runCommand(nodeExec, args, { cwd: projectRoot });
}

function logScores() {
    if (!fs.existsSync(jsonReportPath)) {
        console.warn('Lighthouse JSON report was not generated.');
        return;
    }

    const report = JSON.parse(fs.readFileSync(jsonReportPath, 'utf8'));
    const categories = report.categories || {};
    const formatScore = (key) => {
        const value = categories[key];
        return value ? Math.round((value.score || 0) * 100) : 'n/a';
    };

    const summary = {
        performance: formatScore('performance'),
        accessibility: formatScore('accessibility'),
        bestPractices: formatScore('best-practices'),
        seo: formatScore('seo'),
        pwa: formatScore('pwa'),
    };

    console.log('Lighthouse scores (0-100):');
    console.log(`  Performance:    ${summary.performance}`);
    console.log(`  Accessibility:  ${summary.accessibility}`);
    console.log(`  Best Practices: ${summary.bestPractices}`);
    console.log(`  SEO:            ${summary.seo}`);
    if (summary.pwa !== 'n/a') {
        console.log(`  PWA:            ${summary.pwa}`);
    }

    console.log('\nReports saved to:');
    console.log(`  JSON: ${jsonReportPath}`);
    console.log(`  HTML: ${htmlReportPath}`);
}

async function main() {
    try {
        await runNextBuild();
        serverProcess = startServer();
        await waitForServer();
        await runLighthouse();
        logScores();
    } catch (err) {
        console.error('Lighthouse audit failed:', err.message);
        process.exitCode = 1;
    } finally {
        await stopServer(serverProcess);
    }
}

process.on('SIGINT', () => stopServer(serverProcess, 'SIGINT').then(() => process.exit(1)));
process.on('SIGTERM', () => stopServer(serverProcess, 'SIGTERM').then(() => process.exit(1)));

main();
