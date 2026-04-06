import path from 'node:path';

import type { PropsInfoJson } from '~/models/json';

export interface WriteFile {
    filePath: string;
    content: string;
}

export function serializePropsInfo(data: PropsInfoJson): string {
    return JSON.stringify(data, null, 2);
}

export function buildWriteFiles(
    props: PropsInfoJson[],
    outputDir: string,
    toFileName: (prop: PropsInfoJson) => string,
): WriteFile[] {
    return props.map((prop) => ({
        filePath: path.join(outputDir, toFileName(prop)),
        content: serializePropsInfo(prop),
    }));
}
