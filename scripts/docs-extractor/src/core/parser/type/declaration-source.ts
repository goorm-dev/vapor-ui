/**
 * Declaration source module
 *
 * Determines where symbols are declared (project, base-ui, react, dom, external).
 */
import type { Symbol } from 'ts-morph';

import { DeclarationSourceType } from '~/core/parser/constants';

const REACT_TYPES_PATTERNS = ['node_modules/@types/react', 'node_modules/@types/react-dom'];

const DOM_TYPES_PATTERNS = ['node_modules/typescript/lib'];

const BASE_UI_PATTERN = '@base-ui';

const SPRINKLES_PATTERN = 'sprinkles.css';

export function getDeclarationSourceType(filePath: string | undefined): DeclarationSourceType {
    if (!filePath) return DeclarationSourceType.PROJECT;

    // React types 확인
    if (REACT_TYPES_PATTERNS.some((pattern) => filePath.includes(pattern))) {
        return DeclarationSourceType.REACT_TYPES;
    }

    // DOM types 확인
    if (DOM_TYPES_PATTERNS.some((pattern) => filePath.includes(pattern))) {
        return DeclarationSourceType.DOM_TYPES;
    }

    // Base UI 확인
    if (filePath.includes(BASE_UI_PATTERN)) {
        return DeclarationSourceType.BASE_UI;
    }

    // 기타 node_modules
    if (filePath.includes('node_modules')) {
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

export function getSymbolSourcePath(symbol: Symbol): string | undefined {
    const declarations = symbol.getDeclarations();
    if (!declarations.length) return undefined;
    return declarations[0].getSourceFile().getFilePath();
}

export function isSymbolFromExternalSource(symbol: Symbol): boolean {
    const filePath = getSymbolSourcePath(symbol);
    return isExternalDeclaration(filePath);
}

export function isSymbolFromSprinkles(symbol: Symbol): boolean {
    const filePath = getSymbolSourcePath(symbol);
    return filePath?.includes(SPRINKLES_PATTERN) ?? false;
}

export function isSymbolFromBaseUi(symbol: Symbol): boolean {
    const filePath = getSymbolSourcePath(symbol);
    return filePath?.includes(BASE_UI_PATTERN) ?? false;
}
