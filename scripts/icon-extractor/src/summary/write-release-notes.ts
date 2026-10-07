/**
 * Turn what the sync runs recorded into the two files the workflow commits and posts:
 * a changeset entry and the pull request body.
 *
 * Usage:
 *   tsx ./src/summary/write-release-notes.ts
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

import { REPO_ROOT } from '~/utils/file-system';
import { log } from '~/utils/logger';

import { renderChangeset, renderPrBody } from './release-notes';
import { readSyncSummary } from './sync-summary';

const [basic, symbol] = await Promise.all([readSyncSummary('basic'), readSyncSummary('symbol')]);
const summaries = { basic, symbol };

const { GITHUB_SERVER_URL, GITHUB_REPOSITORY, GITHUB_RUN_ID } = process.env;
const runUrl = `${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}`;

// Same shape as the shell's `date +%Y%m%d%H%M%S`: unique per run, sorts chronologically.
const stamp = new Date().toISOString().replace(/\D/g, '').slice(0, 14);
const changesetFile = path.join(REPO_ROOT, '.changeset', `sync-icons-${stamp}.md`);
const prBodyFile = path.join(REPO_ROOT, 'pr_body.md');

await fs.writeFile(changesetFile, renderChangeset(summaries));
await fs.writeFile(prBodyFile, renderPrBody(summaries, runUrl));

log.info(`Wrote ${path.relative(REPO_ROOT, changesetFile)} and pr_body.md`);
