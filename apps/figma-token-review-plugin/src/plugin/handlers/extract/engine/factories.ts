import { readBoundToken } from '../variables';
import type { EmissionOf, ExtractCtx, ExtractionRule, FactCategory, NodeGuard } from './types';

/** Figma px 값을 CSS 문자열로. */
export const px = (v: number): string => `${v}px`;

type ScalarCategory = 'spaces' | 'dimensions';

/**
 * ScalarCategory 별 property 타입을 분배 조건 타입으로 보존.
 * EmissionOf[C]['property'] 는 제네릭 C 로 인덱싱 불가이므로 이 형태를 사용.
 */
type PropertyOf<C extends ScalarCategory> = C extends 'spaces'
    ? EmissionOf['spaces']['property']
    : EmissionOf['dimensions']['property'];

/**
 * "숫자 필드 하나 + boundVariables 토큰 해석 + 포맷" 패턴의 완전 선언 규칙.
 * gap/width/height 처럼 필드 하나가 emission 하나로 떨어지는 경우 전용.
 */
export function tokenField<C extends ScalarCategory>(opts: {
    name: string;
    category: C;
    property: PropertyOf<C>;
    field: string;
    guards?: readonly NodeGuard[];
    format?: (v: number) => string;
}): ExtractionRule<C> {
    const format = opts.format ?? px;

    return {
        name: opts.name,
        category: opts.category,
        filterKeys: [opts.field],
        guards: opts.guards,
        extract: async (node: SceneNode, ctx: ExtractCtx) => {
            const raw = (node as unknown as Record<string, unknown>)[opts.field];
            if (typeof raw !== 'number') return [];

            const { token, appliedToken, status } = await readBoundToken(
                node,
                ctx.boundVariables,
                opts.field,
            );

            return [
                {
                    property: opts.property,
                    value: format(raw),
                    token,
                    appliedToken,
                    tokenStatus: status,
                } as unknown as EmissionOf[C],
            ];
        },
    };
}

/**
 * 복합 규칙: 선언부(카테고리/필터키/가드)만 테이블에 노출하고
 * 로직은 순수 reader 함수로 격리한다.
 */
export function composite<C extends FactCategory>(opts: {
    name: string;
    category: C;
    filterKeys: readonly string[];
    guards?: readonly NodeGuard[];
    read: ExtractionRule<C>['extract'];
}): ExtractionRule<C> {
    return {
        name: opts.name,
        category: opts.category,
        filterKeys: opts.filterKeys,
        guards: opts.guards,
        extract: opts.read,
    };
}
