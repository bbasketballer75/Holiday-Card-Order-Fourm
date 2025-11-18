#!/usr/bin/env bash
set -euo pipefail

# Purge sensitive files from repo history using git-filter-repo.
# IMPORTANT: This is a destructive operation that will rewrite history and
# requires force-pushing to the remote. All collaborators must re-clone or
# reset their local clones after this completes.

REPO_URL=${REPO_URL:-$(git remote get-url origin)}
MIRROR_DIR=${MIRROR_DIR:-./repo-mirror.git}
BACKUP_DIR=${BACKUP_DIR:-./repo-mirror-backup}

FILES_TO_REMOVE=(
  "friendly-city-print-shop/.env.local"
  "friendly-city-print-shop/.env.*"
)

echo "This script will rewrite the repository history and remove the following paths:"
for p in "${FILES_TO_REMOVE[@]}"; do echo " - $p"; done

read -p "Proceed? This will force push the rewritten history to origin (y/N): " -r
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Aborting. No changes made."
  exit 0
fi

echo "Cloning a full mirror to $MIRROR_DIR..."
git clone --mirror "$REPO_URL" "$MIRROR_DIR"

pushd "$MIRROR_DIR" >/dev/null
echo "Backing up mirror refs to $BACKUP_DIR..."
mkdir -p "$BACKUP_DIR"
git for-each-ref --format='%(refname)' refs/ | xargs -I % sh -c 'git show-ref --abbrev=40 % > "$BACKUP_DIR/%" || true'

PYTHON_CMD=${PYTHON:-$(command -v python || command -v python3 || true)}
if [ -z "$PYTHON_CMD" ]; then
  echo "No python interpreter found in PATH. Please install Python 3 and ensure it's on PATH, or set the PYTHON environment variable to point to the python executable."
  popd >/dev/null; exit 1
fi

if ! command -v git-filter-repo >/dev/null 2>&1; then
  echo "git-filter-repo not on PATH. Attempting to install via pip using $PYTHON_CMD..."
  "$PYTHON_CMD" -m pip install --upgrade git-filter-repo || true
fi

echo "Removing paths with git-filter-repo (via python module)..."
args=()
for p in "${FILES_TO_REMOVE[@]}"; do
  args+=(--path "$p")
done
"$PYTHON_CMD" -m git_filter_repo --invert-paths "${args[@]}" || {
  echo "git-filter-repo failed. Exiting. Please inspect the mirror repository at $MIRROR_DIR"; popd >/dev/null; exit 1;
}

echo "Pushing rewritten history as mirror to origin (force)..."
git push --force --mirror origin

echo "History rewrite complete. The repository at origin has been rewritten."
popd >/dev/null

echo "Reminder: All collaborators must re-clone the repo. See docs/SECURITY-ROTATE-SECRETS.md for more instructions and post-rotation steps."
