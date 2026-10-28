#!/usr/bin/env bash
set -eo pipefail

if [[ -n "$VERCEL_GIT_PREVIOUS_SHA" ]]; then
  BASE="$VERCEL_GIT_PREVIOUS_SHA"
else
  git fetch origin main:refs/remotes/origin/main --depth=50 || exit 1
  BASE="origin/main"
fi

git diff --quiet "$BASE" HEAD -- apps/website
