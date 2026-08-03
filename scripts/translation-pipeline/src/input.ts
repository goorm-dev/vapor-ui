import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import type { TranslatableDoc } from '~/domain';
import { errorMessage } from '~/util';

export interface InputDoc {
    doc: TranslatableDoc;
    raw: Record<string, unknown>;
    fileName: string;
}

export function readInputDocs(inputDir: string): InputDoc[] {
    if (!existsSync(inputDir)) {
        throw new Error(`Input directory does not exist: ${inputDir}`);
    }
    const entries = readdirSync(inputDir, { withFileTypes: true })
        .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
        .map((entry) => entry.name)
        .sort();

    const docs: InputDoc[] = [];
    for (const fileName of entries) {
        const filePath = join(inputDir, fileName);
        let raw: unknown;
        try {
            raw = JSON.parse(readFileSync(filePath, 'utf-8'));
        } catch (error) {
            throw new Error(`Failed to parse ${fileName}: ${errorMessage(error)}`);
        }

        const doc = normalizeDoc(raw, fileName);
        docs.push({ doc, raw: raw as Record<string, unknown>, fileName });
    }
    return docs;
}

function normalizeDoc(raw: unknown, fileName: string): TranslatableDoc {
    if (typeof raw !== 'object' || raw === null) {
        throw new Error(`${fileName}: expected an object at top level`);
    }
    const record = raw as Record<string, unknown>;
    const name = record['name'];
    if (typeof name !== 'string' || !name) {
        throw new Error(`${fileName}: missing required string field "name"`);
    }
    const description =
        typeof record['description'] === 'string' ? record['description'] : undefined;
    const propsRaw = record['props'];
    const props = Array.isArray(propsRaw)
        ? propsRaw.map((prop, index) => normalizeProp(prop, fileName, index))
        : [];
    return { name, description, props };
}

function normalizeProp(
    raw: unknown,
    fileName: string,
    index: number,
): TranslatableDoc['props'][number] {
    if (typeof raw !== 'object' || raw === null) {
        throw new Error(`${fileName}: props[${index}] is not an object`);
    }
    const record = raw as Record<string, unknown>;
    const name = record['name'];
    if (typeof name !== 'string' || !name) {
        throw new Error(`${fileName}: props[${index}] missing "name"`);
    }
    const description =
        typeof record['description'] === 'string' ? record['description'] : undefined;
    return { name, description };
}
