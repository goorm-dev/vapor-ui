import type MagicString from 'magic-string';

import type { AnyProp } from '~/models/types';

/**
 * className 과 style 이 같은 조건을 각자 읽을 때, 조건을 한 번만 평가하게 하는 임시 변수.
 *
 * Babel 의 `scope.maybeGenerateMemoised` 와 같은 규칙이다: 다시 읽어도 결과·부작용이 같은 식
 * (`isRereadable`)은 그대로 두 번 읽고, 그 밖의 식만 임시 변수에 한 번 담아 재사용한다.
 * 임시 변수는 식이 평가되는 스코프에 `let` 으로 선언한다 — 렌더마다 새 값이고, 재귀 호출이
 * 서로의 값을 덮지 않는다.
 * - 함수 body 안: 그 body.
 * - 함수 파라미터 기본값 안: 기본값은 body 와 다른 스코프에서 body 보다 먼저 평가되어 body 의
 *   `let` 을 볼 수 없다. 그 기본값 식만 `(() => { let t; return <식>; })()` 로 감싼다 — arrow 는
 *   `this`·`arguments` 를 물려받고, 기본값 안에는 `await`/`yield` 가 올 수 없어 의미가 같다.
 * - 그 밖(모듈 최상위): 모듈.
 */

const FUNCTION_TYPES = new Set([
    'FunctionDeclaration',
    'FunctionExpression',
    'ArrowFunctionExpression',
]);

const TS_WRAPPERS = new Set([
    'ParenthesizedExpression',
    'TSAsExpression',
    'TSSatisfiesExpression',
    'TSNonNullExpression',
]);

const PURE_UNARY = new Set(['!', '-', '+', '~', 'typeof', 'void']);

/**
 * 다시 평가해도 같은 값·부작용 없음이 문법으로 보장되는 식. 식별자, `this`, 리터럴과 그 단항 연산.
 * 멤버 접근은 getter 일 수 있어 제외한다 (Babel `scope.isStatic` 과 같은 기준).
 */
export function isRereadable(node: AnyProp): boolean {
    if (!node) return false;
    if (TS_WRAPPERS.has(node.type)) return isRereadable(node.expression);
    switch (node.type) {
        case 'Identifier':
        case 'ThisExpression':
        case 'Literal':
            return true;
        case 'TemplateLiteral':
            return (node.expressions ?? []).length === 0;
        case 'UnaryExpression':
            return PURE_UNARY.has(node.operator) && isRereadable(node.argument);
        default:
            return false;
    }
}

/** 임시 변수를 선언할 곳. */
export type MemoScope =
    { kind: 'body'; fn: AnyProp } | { kind: 'default'; expr: AnyProp } | { kind: 'module' };

const MODULE_SCOPE: MemoScope = { kind: 'module' };

/**
 * `node`(조상 체인 `parents`, 위 → 아래)가 평가되는 스코프. 가장 가까운 함수를 찾되, 그 함수의
 * 파라미터 안이면 node 를 담은 가장 바깥 기본값 식(`AssignmentPattern.right`)을 스코프로 본다.
 */
export function memoScopeOf(parents: AnyProp[], node: AnyProp): MemoScope {
    for (let i = parents.length - 1; i >= 0; i--) {
        const fn = parents[i];
        if (!FUNCTION_TYPES.has(fn?.type)) continue;
        const child = parents[i + 1] ?? node;
        if (child === fn.body) return { kind: 'body', fn };
        // 파라미터 안: fn 아래로 내려가며 처음 만나는 기본값 식.
        for (let j = i + 1; j < parents.length; j++) {
            const p = parents[j];
            const next = parents[j + 1] ?? node;
            if (p.type === 'AssignmentPattern' && p.right === next) {
                return { kind: 'default', expr: next };
            }
        }
        return { kind: 'body', fn };
    }
    return MODULE_SCOPE;
}

const scopeKey = (s: MemoScope): AnyProp | null =>
    s.kind === 'body' ? s.fn : s.kind === 'default' ? s.expr : null;

export class MemoTemps {
    #count = 0;
    /** 소스 위치(`start:end`) → 임시 변수 이름. 같은 식은 한 변수를 쓴다. */
    readonly #byPos = new Map<string, string>();
    /** 스코프 노드(모듈은 `null`) → 스코프와 그 안에 선언할 이름들. */
    readonly #byScope = new Map<AnyProp | null, { scope: MemoScope; names: string[] }>();

    /** 이 위치의 식을 담을 임시 변수 이름. 처음이면 스코프에 등록한다. */
    nameFor(start: number, end: number, scope: MemoScope): string {
        const pos = `${start}:${end}`;
        let name = this.#byPos.get(pos);
        if (!name) {
            name = `__vaporT_${this.#count++}`;
            this.#byPos.set(pos, name);
            const key = scopeKey(scope);
            const entry = this.#byScope.get(key) ?? { scope, names: [] };
            entry.names.push(name);
            this.#byScope.set(key, entry);
        }
        return name;
    }

    /**
     * 스코프마다 `let` 선언을 넣는다. 함수 body 의 directive prologue 뒤, 식 body arrow 는
     * block 으로 바꾼다. 파라미터 기본값 식은 즉시 호출 arrow 로 감싼다. 모듈 스코프는
     * `atModuleTop` 이 넣는다. 감싸는 편집은 식 안의 다른 편집보다 바깥에 와야 하므로
     * `prependLeft` 를 쓴다.
     */
    flush(ms: MagicString, atModuleTop: (line: string) => void) {
        for (const { scope, names } of this.#byScope.values()) {
            const decl = `let ${names.join(', ')};`;
            if (scope.kind === 'module') {
                atModuleTop(decl);
                continue;
            }
            if (scope.kind === 'default') {
                ms.prependLeft(scope.expr.start, `(() => { ${decl} return `);
                ms.appendLeft(scope.expr.end, `; })()`);
                continue;
            }
            const body = scope.fn.body;
            if (body.type === 'BlockStatement') {
                let at = body.start + 1;
                for (const stmt of body.body) {
                    if (stmt.type !== 'ExpressionStatement' || typeof stmt.directive !== 'string')
                        break;
                    at = stmt.end;
                }
                ms.appendLeft(at, ` ${decl}`);
            } else {
                ms.prependLeft(body.start, `{ ${decl} return `);
                ms.appendLeft(body.end, `; }`);
            }
        }
    }
}
