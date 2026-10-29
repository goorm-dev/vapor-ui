#!/usr/bin/env bash
set -eo pipefail

cd "$(git rev-parse --show-toplevel)"

# main 브랜치는 diff 비교해도 변경 없음 → 명시적으로 build
if [[ "$VERCEL_GIT_COMMIT_REF" == "main" ]]; then
  exit 1
fi

git fetch origin main:refs/remotes/origin/main --depth=50 || exit 1
git diff --quiet origin/main HEAD -- apps/website