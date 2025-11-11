/**
 * JSX Builder
 *
 * PRD 8.2: JSX 코드 생성
 */

import type { SemanticIR } from '../../../domain/types';

/**
 * JSX 코드 생성 (재귀)
 *
 * @param node - Semantic IR 노드 또는 문자열
 * @param depth - 들여쓰기 depth
 * @returns JSX 문자열
 */
export function generateJSX(
    node: SemanticIR | string,
    depth = 0,
): string {
    // 텍스트 노드
    if (typeof node === 'string') {
        const indent = '  '.repeat(depth);
        return `${indent}${node}`;
    }

    const { componentName, props, children } = node;
    const indent = '  '.repeat(depth);

    // Props 문자열 생성
    const propsEntries = Object.entries(props);
    const propsStr =
        propsEntries.length > 0
            ? ' ' + propsEntries.map(([key, value]) => formatProp(key, value)).join(' ')
            : '';

    // Self-closing (자식 없음)
    if (!children || children.length === 0) {
        return `${indent}<${componentName}${propsStr} />`;
    }

    // With children (자식 있음)
    const childrenStr = children
        .map((child) => {
            // 타입 가드: child가 RawIR인 경우 SemanticIR로 변환
            if (typeof child !== 'string' && !('imports' in child)) {
                const semanticChild: SemanticIR = {
                    ...child,
                    imports: new Set(),
                };
                return generateJSX(semanticChild, depth + 1);
            }
            return generateJSX(child as SemanticIR | string, depth + 1);
        })
        .join('\n');

    return `${indent}<${componentName}${propsStr}>
${childrenStr}
${indent}</${componentName}>`;
}

/**
 * Prop 포맷팅
 *
 * @param key - Prop 이름
 * @param value - Prop 값
 * @returns Prop 문자열
 */
function formatProp(key: string, value: unknown): string {
    // Boolean (true)
    if (typeof value === 'boolean') {
        return value ? key : '';
    }

    // String
    if (typeof value === 'string') {
        return `${key}="${value}"`;
    }

    // Number
    if (typeof value === 'number') {
        return `${key}={${value}}`;
    }

    // Object or Array
    return `${key}={${JSON.stringify(value)}}`;
}
