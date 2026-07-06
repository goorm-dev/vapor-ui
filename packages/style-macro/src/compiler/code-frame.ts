import { codeFrameColumns } from '@babel/code-frame';

import type { BuildError } from '~/model/types';

export function formatBuildError(err: BuildError, source: string, filename: string): string {
    const frame = codeFrameColumns(
        source,
        { start: { line: err.loc.line, column: err.loc.column + 1 } },
        { highlightCode: false },
    );

    return `${filename}:${err.loc.line}:${err.loc.column} [${err.code}] ${err.message}\n${frame}`;
}
