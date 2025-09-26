import * as inspector from 'node:inspector';
import * as path from 'node:path';
import ts from 'typescript';

export const isDebug = inspector.url() !== undefined;

export function shouldSkipFile(file: string): boolean {
    const basename = path.basename(file);
    return basename === 'index.ts' || basename === 'index.tsx';
}
