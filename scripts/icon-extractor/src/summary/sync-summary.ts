import fs from 'node:fs/promises';
import path from 'node:path';

import type { IconType } from '~/config';
import { REPO_ROOT } from '~/utils/file-system';

/** What one `--type=<...>` run changed. */
type SyncSummary = {
    created: string[];
    updated: string[];
    deleted: string[];
    total: number;
};

// Each icon type syncs in its own workflow step, but the changeset and PR body describe both.
// The runs hand their results over as files because every step is a separate process.
const SUMMARY_DIR = path.join(REPO_ROOT, '.sync-summary');

const summaryFile = (type: IconType) => path.join(SUMMARY_DIR, `${type}.json`);

const writeSyncSummary = async (type: IconType, summary: SyncSummary): Promise<void> => {
    await fs.mkdir(SUMMARY_DIR, { recursive: true });
    await fs.writeFile(summaryFile(type), `${JSON.stringify(summary, null, 2)}\n`);
};

/** An absent file means that type never ran, which reads the same as "changed nothing". */
const readSyncSummary = async (type: IconType): Promise<SyncSummary> => {
    const raw = await fs.readFile(summaryFile(type), 'utf8').catch(() => null);
    if (raw === null) return { created: [], updated: [], deleted: [], total: 0 };
    return JSON.parse(raw) as SyncSummary;
};

export type { SyncSummary };
export { readSyncSummary, writeSyncSummary };
