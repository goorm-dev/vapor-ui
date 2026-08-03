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
    return readdirSync(inputDir)
        .filter((name) => name.endsWith('.json'))
        .sort()
        .map((fileName) => {
            let raw: unknown;
            try {
                raw = JSON.parse(readFileSync(join(inputDir, fileName), 'utf-8'));
            } catch (error) {
                throw new Error(`Failed to parse ${fileName}: ${errorMessage(error)}`);
            }
            return {
                doc: toTranslatableDoc(raw, fileName),
                raw: raw as Record<string, unknown>,
                fileName,
            };
        });
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null;

const optionalString = (value: unknown) => (typeof value === 'string' ? value : undefined);

function toTranslatableDoc(raw: unknown, fileName: string): TranslatableDoc {
    if (!isRecord(raw) || typeof raw['name'] !== 'string' || !raw['name']) {
        throw new Error(`${fileName}: not a component doc (missing string field "name")`);
    }
    const propsRaw = Array.isArray(raw['props']) ? raw['props'] : [];
    return {
        name: raw['name'],
        displayName: optionalString(raw['displayName']) ?? raw['name'],
        description: optionalString(raw['description']),
        props: propsRaw.map((entry) => {
            const prop = isRecord(entry) ? entry : {};
            return {
                name: optionalString(prop['name']) ?? '',
                description: optionalString(prop['description']),
            };
        }),
    };
}
