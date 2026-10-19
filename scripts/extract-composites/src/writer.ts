import { mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

export async function prepareOutputs(
    contentFile: string,
    publicDir: string,
    clean: boolean,
): Promise<void> {
    if (clean) {
        await rm(publicDir, { recursive: true, force: true });
        await rm(contentFile, { force: true });
    }
    await mkdir(dirname(contentFile), { recursive: true });
    await mkdir(publicDir, { recursive: true });
}

export async function writeComponentMdx(path: string, content: string): Promise<void> {
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, content);
}
