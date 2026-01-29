/**
 * 선언 위치(Declaration Source) 기반 필터링 모듈
 *
 * 심볼이 어디서 선언되었는지 확인하여 React/DOM 내장 타입과
 * 프로젝트/라이브러리 타입을 구분합니다.
 */
import type { Symbol } from 'ts-morph';

export enum DeclarationSourceType {
    PROJECT = 'project',
    BASE_UI = 'base-ui',
    REACT_TYPES = 'react-types',
    DOM_TYPES = 'dom-types',
    EXTERNAL = 'external',
}

const REACT_TYPES_PATTERNS = ['node_modules/@types/react', 'node_modules/@types/react-dom'];

const DOM_TYPES_PATTERNS = ['node_modules/typescript/lib'];

const BASE_UI_PATTERN = '@base-ui/react';

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
