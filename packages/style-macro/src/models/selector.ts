/**
 * 중첩 selector 모델.
 *
 * 각 중첩 단계에서 부모 context 에 대해 바로 푼다 (Sass · postcss-nested · Compiled 와 같다).
 * - selector key: 부모 selector 목록 × 자식 selector 목록의 곱. 자식에 `&` 가 있으면 그 자리에
 *   부모를, 없으면 부모 뒤에 붙인다 (`:hover` = `&:hover`).
 * - at-rule key: selector 에 섞지 않고 at-rule 스택에 쌓는다. CSS 로는 바깥부터 감싼다
 *   (CSS Nesting 의 nested group rule 과 같은 결과).
 *
 * `&` 는 이 블록의 class 를 뜻한다. class 이름은 블록 선언이 모두 모인 뒤 정해지므로
 * emit 단계에서 `resolveSelector` 로 바꾼다.
 */

export interface RuleContext {
    /** 바깥 → 안쪽 at-rule prelude. 공백은 하나로 축약. */
    atRules: readonly string[];
    /** 풀린 selector 목록 (`, ` 로 연결). `&` = 블록 class. */
    selector: string;
}

export const ROOT_CONTEXT: RuleContext = { atRules: [], selector: '&' };

const NESTED_PREFIXES = ['::', ':', '[', '&'];

/**
 * 중첩 rule key 인지 — 아니면 CSS 속성 이름이다. CSS Nesting 처럼 key 의 첫 글자로 정한다
 * (속성 이름은 `:`·`[`·`&`·`@` 로 시작할 수 없다). 값의 모양으로 정하지 않는다.
 */
export const isNestedKey = (key: string): boolean => {
    const k = key.trimStart();
    return isAtRuleKey(k) || NESTED_PREFIXES.some((p) => k.startsWith(p));
};

/** `@` 로 시작하면 at-rule, 아니면 selector key. */
export const isAtRuleKey = (key: string): boolean => key.startsWith('@');

/**
 * 부모 context 에 중첩 key 하나를 더한 context.
 * selector 목록의 각 항목은 `:`, `::`, `[`, `&` 로 시작해야 한다 — bare selector(`div span`)는
 * 다른 element 로 새어 나가므로 금지. 위반 시 throw (메시지에 그 항목을 담는다).
 */
export function nestContext(parent: RuleContext, key: string): RuleContext {
    if (isAtRuleKey(key)) {
        return {
            atRules: [...parent.atRules, normalizeWhitespace(key)],
            selector: parent.selector,
        };
    }

    const children = splitList(key);
    if (children.length === 0) throw new Error(`invalid selector: ${JSON.stringify(key)}.`);
    for (const child of children) {
        if (!NESTED_PREFIXES.some((p) => child.startsWith(p))) {
            throw new Error(
                `invalid selector: ${JSON.stringify(child)}. ` +
                    `Nested keys must start with ':', '::', '@', '[', or '&'.`,
            );
        }
    }

    const selector = splitList(parent.selector)
        .flatMap((p) => children.map((c) => (hasNesting(c) ? replaceNesting(c, p) : `${p}${c}`)))
        .join(', ');
    return { atRules: parent.atRules, selector };
}

/** 같은 context 끼리 같은 문자열. slot·signature key 용. */
export function contextKey(ctx: RuleContext): string {
    return [...ctx.atRules, ctx.selector].join('\u0000');
}

/** `&` 를 `.className` 으로 바꾼 최종 selector. */
export function resolveSelector(selector: string, className: string): string {
    return replaceNesting(selector, `.${className}`);
}

/* ----- selector 텍스트 스캔 ----- */

/**
 * selector 텍스트를 한 글자씩 훑으며 "구조적" 위치(문자열·escape 밖)인 글자만 `onChar` 에 넘긴다.
 * depth 는 괄호 `()` / 대괄호 `[]` 중첩 깊이.
 */
function scan(s: string, onChar: (c: string, i: number, depth: number) => void) {
    let depth = 0;
    let quote: string | null = null;
    for (let i = 0; i < s.length; i++) {
        const c = s[i]!;
        if (c === '\\') {
            i++;
            continue;
        }
        if (quote) {
            if (c === quote) quote = null;
            continue;
        }
        if (c === '"' || c === "'") {
            quote = c;
            continue;
        }
        if (c === '(' || c === '[') depth++;
        else if (c === ')' || c === ']') depth--;
        onChar(c, i, depth);
    }
}

/** 최상위 콤마로 selector 목록 분리. */
function splitList(s: string): string[] {
    const parts: string[] = [];
    let last = 0;
    scan(s, (c, i, depth) => {
        if (c === ',' && depth === 0) {
            parts.push(s.slice(last, i));
            last = i + 1;
        }
    });
    parts.push(s.slice(last));
    return parts.map((p) => p.trim()).filter(Boolean);
}

function nestingPositions(s: string): number[] {
    const at: number[] = [];
    scan(s, (c, i) => {
        if (c === '&') at.push(i);
    });
    return at;
}

const hasNesting = (s: string): boolean => nestingPositions(s).length > 0;

function replaceNesting(s: string, with_: string): string {
    let out = '';
    let last = 0;
    for (const i of nestingPositions(s)) {
        out += s.slice(last, i) + with_;
        last = i + 1;
    }
    return out + s.slice(last);
}

/** CSS 공백 문자(space/tab/LF/CR/FF)만 하나로 축약 후 양끝 공백 제거. */
function normalizeWhitespace(s: string): string {
    return s.replace(/[ \t\n\r\f]+/g, ' ').trim();
}
