/**
 * Declaration source module
 *
 * Determines where symbols are declared (project, base-ui, react, dom, external).
 */
import type { Symbol as TsSymbol } from 'ts-morph';

import type { PropSource } from '~/models/pipeline';

export enum DeclarationSourceType {
    PROJECT = 'project',
    REACT_TYPES = 'react-types',
    DOM_TYPES = 'dom-types',
    BASE_UI = 'base-ui',
    EXTERNAL = 'external',
}

const REACT_TYPES_PATTERNS = ['node_modules/@types/react', 'node_modules/@types/react-dom'];

const DOM_TYPES_PATTERNS = ['node_modules/typescript/lib'];

const BASE_UI_PATTERN = '@base-ui';

const SPRINKLES_PATTERN = 'sprinkles.css';

function normalizeFilePath(filePath: string): string {
    return filePath.replace(/\\/g, '/');
}

export function getDeclarationSourceType(filePath: string | undefined): DeclarationSourceType {
    // undefined is treated as a project-level declaration as a safe fallback.
    // This handles cases where a symbol has no source file (e.g., built-in types
    // or ts-morph synthetic nodes) without propagating errors to callers.
    if (!filePath) return DeclarationSourceType.PROJECT;
    const normalizedPath = normalizeFilePath(filePath);

    // React types 확인
    if (REACT_TYPES_PATTERNS.some((pattern) => normalizedPath.includes(pattern))) {
        return DeclarationSourceType.REACT_TYPES;
    }

    // DOM types 확인
    if (DOM_TYPES_PATTERNS.some((pattern) => normalizedPath.includes(pattern))) {
        return DeclarationSourceType.DOM_TYPES;
    }

    // Base UI 확인
    if (normalizedPath.includes(BASE_UI_PATTERN)) {
        return DeclarationSourceType.BASE_UI;
    }

    // 기타 node_modules
    if (normalizedPath.includes('node_modules')) {
        return DeclarationSourceType.EXTERNAL;
    }

    // 프로젝트 파일
    return DeclarationSourceType.PROJECT;
}

export function isExternalDeclaration(filePath: string | undefined): boolean {
    const sourceType = getDeclarationSourceType(filePath);
    return (
        sourceType === DeclarationSourceType.REACT_TYPES ||
        sourceType === DeclarationSourceType.DOM_TYPES ||
        sourceType === DeclarationSourceType.EXTERNAL
    );
}

/**
 * Returns the source file path of the symbol's first declaration.
 * For symbols with multiple declarations (e.g., interface merging), only the
 * first declaration's path is returned. Use the `isSymbolFrom*` helpers when
 * you need to check all declarations.
 */
export function getSymbolSourcePath(symbol: TsSymbol): string | undefined {
    const declarations = symbol.getDeclarations();
    if (!declarations.length) return undefined;
    return declarations[0].getSourceFile().getFilePath();
}

export function isSymbolFromExternalSource(symbol: TsSymbol): boolean {
    return symbol
        .getDeclarations()
        .some((decl) => isExternalDeclaration(decl.getSourceFile().getFilePath()));
}

export function isSymbolFromSprinkles(symbol: TsSymbol): boolean {
    return symbol
        .getDeclarations()
        .some((decl) =>
            normalizeFilePath(decl.getSourceFile().getFilePath()).includes(SPRINKLES_PATTERN),
        );
}

export function isSymbolFromBaseUi(symbol: TsSymbol): boolean {
    return symbol
        .getDeclarations()
        .some((decl) =>
            normalizeFilePath(decl.getSourceFile().getFilePath()).includes(BASE_UI_PATTERN),
        );
}

export function isSprinklesPath(filePath: string | undefined): boolean {
    if (!filePath) return false;
    return normalizeFilePath(filePath).includes(SPRINKLES_PATTERN);
}

export function classifyPropSource(symbol: TsSymbol): PropSource {
    const filePath = getSymbolSourcePath(symbol);
    if (!filePath) return 'project';
    const normalized = normalizeFilePath(filePath);
    if (REACT_TYPES_PATTERNS.some((p) => normalized.includes(p))) return 'react';
    if (DOM_TYPES_PATTERNS.some((p) => normalized.includes(p))) return 'dom';
    if (normalized.includes(BASE_UI_PATTERN)) return 'base-ui';
    if (normalized.includes(SPRINKLES_PATTERN)) return 'sprinkles';
    if (normalized.endsWith('.css.ts')) return 'variants';
    if (normalized.includes('node_modules')) return 'external';
    return 'project';
}
