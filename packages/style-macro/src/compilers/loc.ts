import type { AnyProp } from '~/models/types';

export type Loc = { line: number; column: number };

/**
 * 소스 offset → 1-based line / 0-based column. oxc 노드는 ESTree `loc` 없이 UTF-16
 * offset(`start`/`end`)만 주므로, 모든 에러 위치는 이 함수 하나로 계산한다.
 */
export function locAt(source: string, offset: number): Loc {
    const before = source.slice(0, offset);
    return { line: before.split('\n').length, column: offset - (before.lastIndexOf('\n') + 1) };
}

/** 노드 시작 위치. 위치가 없는 노드(합성 노드 등)는 파일 처음. */
export function locOfNode(source: string, node: AnyProp): Loc {
    return locAt(source, typeof node?.start === 'number' ? node.start : 0);
}
