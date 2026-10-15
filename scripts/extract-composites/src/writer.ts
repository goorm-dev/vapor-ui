import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import type { IndexJson } from './types.ts';

export async function prepareOutputDir(dir: string, clean: boolean): Promise<void> {
    if (clean) {
        await rm(dir, { recursive: true, force: true });
    }
    await mkdir(dir, { recursive: true });
}

export async function writeIndexJson(dir: string, data: IndexJson): Promise<void> {
    const path = join(dir, 'index.json');
    await writeFile(path, JSON.stringify(data, null, 4) + '\n');
}
