#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
IMAGE="mcr.microsoft.com/playwright:v1.59.1-noble"
PLATFORM="${VRT_DOCKER_PLATFORM:-linux/amd64}"
NODE_MODULES_VOL="vapor-vrt-linux-node-modules"
PNPM_STORE_VOL="vapor-vrt-linux-pnpm-store"

docker volume create "$NODE_MODULES_VOL" >/dev/null
docker volume create "$PNPM_STORE_VOL" >/dev/null

exec docker run --rm -it \
  --platform "$PLATFORM" \
  -v "$REPO_ROOT":/work:delegated \
  -v "$NODE_MODULES_VOL":/work/node_modules \
  -v "$PNPM_STORE_VOL":/root/.local/share/pnpm/store \
  -w /work \
  --ipc=host \
  -e CI=1 \
  "$IMAGE" \
  bash -c '
    set -euo pipefail
    corepack enable
    pnpm install --frozen-lockfile
    pnpm build:storybook
    pnpm core exec playwright install
    pnpm core exec playwright test -c ./playwright.config.ts "$@"
  ' -- "$@"
