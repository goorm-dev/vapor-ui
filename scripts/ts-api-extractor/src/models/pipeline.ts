import type { Type } from 'ts-morph';

// ──────────────────────────────────────────────────────────────
// PropSource — parse 시점에 분류 완료, filter/transform 양쪽에서 소비
// ──────────────────────────────────────────────────────────────

export type PropSource =
    | 'project' // 프로젝트 일반 .ts/.tsx
    | 'variants' // .css.ts 파일
    | 'sprinkles' // sprinkles.css 패턴
    | 'base-ui' // @base-ui 패키지
    | 'react' // @types/react
    | 'dom' // typescript/lib DOM types
    | 'external'; // 기타 node_modules

// ──────────────────────────────────────────────────────────────
// Parsed (raw AST extraction results)
// ──────────────────────────────────────────────────────────────

export interface ParsedProp {
    name: string;
    typeString: string;
    isOptional: boolean;
    source: PropSource; // 기존 declarationFilePath 대체
    description?: string;
    defaultValue?: string;
}

export interface ParsedComponent {
    name: string;
    description?: string;
    props: ParsedProp[];
}

// ──────────────────────────────────────────────────────────────
// Models (post-transform)
// ──────────────────────────────────────────────────────────────

export type PropCategory = 'required' | 'variants' | 'state' | 'custom' | 'base-ui' | 'composition';

export interface PropModel {
    name: string;
    types: string[];
    required: boolean;
    description?: string;
    defaultValue?: string;
    category: PropCategory;
}

export interface ComponentModel {
    name: string;
    description?: string;
    props: PropModel[];
}

// ──────────────────────────────────────────────────────────────
// Base-UI type resolution
// ──────────────────────────────────────────────────────────────

export interface BaseUiTypeEntry {
    type: Type;
    vaporPath: string;
}

export interface BaseUiTypeMap {
    [normalizedPath: string]: BaseUiTypeEntry;
}
