const { execSync } = require('child_process');
try {
  execSync('npx husky install .husky', { stdio: 'inherit' });
} catch (e) {
  try {
    execSync('npx husky install ../.husky', { stdio: 'inherit' });
  } catch (err) {
    // ignore errors - husky installation is best-effort in varied environments
  }
}
process.exit(0);
