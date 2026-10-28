#!/usr/bin/env bash
set -eo pipefail

cd "$(git rev-parse --show-toplevel)"

if [[ "$VERCEL_GIT_COMMIT_REF" == "main" ]]; then
  exit 1
fi

git fetch origin main:refs/remotes/origin/main --depth=50 || exit 1
git diff --quiet origin/main HEAD -- apps/website
