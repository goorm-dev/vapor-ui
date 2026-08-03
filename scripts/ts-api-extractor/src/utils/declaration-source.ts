/**
 * Declaration source module
 *
 * Determines where a prop symbol is declared (project, variants, sprinkles,
 * base-ui, react, dom, external).
 */
import type { Symbol as TsSymbol } from 'ts-morph';

import type { PropSource } from '~/models/pipeline';

const REACT_TYPES_PATTERNS = ['node_modules/@types/react', 'node_modules/@types/react-dom'];
const DOM_TYPES_PATTERNS = ['node_modules/typescript/lib'];
const BASE_UI_PATTERN = '@base-ui';
const SPRINKLES_PATTERN = 'sprinkles.css';

export function classifyPropSource(symbol: TsSymbol): PropSource {
    // 선언이 없는 심볼(내장 타입, ts-morph 합성 노드)은 프로젝트 선언으로 본다.
    const filePath = symbol.getDeclarations()[0]?.getSourceFile().getFilePath();
    if (!filePath) return 'project';

    const normalized = filePath.replace(/\\/g, '/');
    if (REACT_TYPES_PATTERNS.some((p) => normalized.includes(p))) return 'react';
    if (DOM_TYPES_PATTERNS.some((p) => normalized.includes(p))) return 'dom';
    if (normalized.includes(BASE_UI_PATTERN)) return 'base-ui';
    if (normalized.includes(SPRINKLES_PATTERN)) return 'sprinkles';
    if (normalized.endsWith('.css.ts')) return 'variants';
    if (normalized.includes('node_modules')) return 'external';
    return 'project';
}
