#!/usr/bin/env bash
set -euo pipefail

SOURCE_BRANCH="${SOURCE_BRANCH:-main}"
PAGES_BRANCH="${PAGES_BRANCH:-gh-pages}"
BUILD_DIR="${BUILD_DIR:-dist}"
BUILD_CMD="${BUILD_CMD:-npm run build}"

echo "Checking working tree..."
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "Working tree has uncommitted changes. Commit or stash them first."
  exit 1
fi

CURRENT_BRANCH="$(git branch --show-current)"

echo "Switching to ${SOURCE_BRANCH}..."
git checkout "$SOURCE_BRANCH"

echo "Pulling latest ${SOURCE_BRANCH}..."
git pull origin "$SOURCE_BRANCH"

echo "Building site..."
eval "$BUILD_CMD"

if [ ! -d "$BUILD_DIR" ]; then
  echo "Build directory '${BUILD_DIR}' does not exist."
  exit 1
fi

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

echo "Copying built site to temp dir..."
cp -R "$BUILD_DIR"/. "$TMP_DIR"/

echo "Preparing ${PAGES_BRANCH} branch..."

if git ls-remote --exit-code --heads origin "$PAGES_BRANCH" >/dev/null 2>&1; then
  git fetch origin "$PAGES_BRANCH"
  git checkout "$PAGES_BRANCH"
  git reset --hard "origin/$PAGES_BRANCH"
else
  git checkout --orphan "$PAGES_BRANCH"
fi

echo "Cleaning ${PAGES_BRANCH}..."
git rm -rf . >/dev/null 2>&1 || true

# Remove untracked files too, but preserve .git
find . -mindepth 1 -maxdepth 1 ! -name ".git" -exec rm -rf {} +

echo "Copying built site into ${PAGES_BRANCH}..."
cp -R "$TMP_DIR"/. .

# For GitHub Pages custom domain
if [ -n "${CUSTOM_DOMAIN:-}" ]; then
  echo "$CUSTOM_DOMAIN" > CNAME
fi

# Optional, but useful for static sites with files/folders starting with underscore
touch .nojekyll

git add -A

if git diff --cached --quiet; then
  echo "No changes to publish."
else
  git commit -m "Deploy site"
  git push origin "$PAGES_BRANCH"
fi

echo "Returning to ${CURRENT_BRANCH}..."
git checkout "$CURRENT_BRANCH"

echo "Done."