import type { AnyProp } from '~/models/types';

/** 값에 영향 없는 래퍼(`as`, `satisfies`, `!`, 괄호). 안쪽 식은 `expression`. */
export const TYPE_ONLY_WRAPPERS: ReadonlySet<string> = new Set([
    'ParenthesizedExpression',
    'TSAsExpression',
    'TSSatisfiesExpression',
    'TSNonNullExpression',
]);

/** 값에 영향 없는 래퍼(`as`, `satisfies`, `!`, 괄호)를 벗긴다. */
export function unwrapTypeOnly(node: AnyProp): AnyProp {
    let n = node;
    while (n && TYPE_ONLY_WRAPPERS.has(n.type)) n = n.expression;
    return n;
}
