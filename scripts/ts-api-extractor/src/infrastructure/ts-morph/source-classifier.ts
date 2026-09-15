/**
 * Declaration source module
 *
 * Where a symbol was declared. `classifyPath` is the single place that knows the
 * path patterns; everything else derives from it, so a pattern only ever has to
 * be corrected once.
 */
import type { PropSource } from '#domain/model';
import type { Symbol as TsSymbol } from 'ts-morph';

const REACT_TYPES_PATTERNS = ['node_modules/@types/react', 'node_modules/@types/react-dom'];

const DOM_TYPES_PATTERNS = ['node_modules/typescript/lib'];

const BASE_UI_PATTERN = '@base-ui';

const SPRINKLES_PATTERN = 'sprinkles.css';

/** Sources vapor-ui itself owns, as opposed to a dependency's declarations. */
const PROJECT_OWNED_SOURCES: ReadonlySet<PropSource> = new Set([
    'project',
    'variants',
    'sprinkles',
]);

function normalizeFilePath(filePath: string): string {
    return filePath.replace(/\\/g, '/');
}

/**
 * undefined is treated as a project declaration as a safe fallback: a symbol
 * with no source file (a built-in type, a ts-morph synthetic node) should not
 * propagate an error to callers.
 */
export function classifyPath(filePath: string | undefined): PropSource {
    if (!filePath) return 'project';

    const normalized = normalizeFilePath(filePath);

    if (REACT_TYPES_PATTERNS.some((pattern) => normalized.includes(pattern))) return 'react';
    if (DOM_TYPES_PATTERNS.some((pattern) => normalized.includes(pattern))) return 'dom';
    if (normalized.includes(BASE_UI_PATTERN)) return 'base-ui';
    if (normalized.includes(SPRINKLES_PATTERN)) return 'sprinkles';
    if (normalized.endsWith('.css.ts')) return 'variants';
    if (normalized.includes('node_modules')) return 'external';

    return 'project';
}

/**
 * Whether the declaration is vapor-ui's own. Used to prefer vapor-ui's JSDoc
 * over base-ui's for a prop that is declared in both.
 */
export function isProjectOwned(filePath: string | undefined): boolean {
    return PROJECT_OWNED_SOURCES.has(classifyPath(filePath));
}

/**
 * Returns the source file path of the symbol's first declaration.
 * Symbols with multiple declarations (e.g. interface merging) report only the
 * first declaration's path.
 */
function getSymbolSourcePath(symbol: TsSymbol): string | undefined {
    const declarations = symbol.getDeclarations();
    if (!declarations.length) return undefined;
    return declarations[0].getSourceFile().getFilePath();
}

export function classifyPropSource(symbol: TsSymbol): PropSource {
    return classifyPath(getSymbolSourcePath(symbol));
}
