#!/usr/bin/env bash
if [[ "$VERCEL_GIT_COMMIT_REF" == renovate/* ]]; then
  exit 0
fi
exit 1
