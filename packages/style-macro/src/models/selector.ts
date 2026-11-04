export type SelectorKind = 'pseudo' | 'pseudo-element' | 'at-rule' | 'attr' | 'self-ref';

export interface ParsedSelector {
    kind: SelectorKind;
    raw: string;
}

/**
 * Nested key 검증. `:`, `::`, `@`, `[`, `&` 로 시작해야 함.
 * bare selector (예: `div span`) 는 scope 오염 방지 위해 금지.
 */
export function parseSelector(key: string): ParsedSelector {
    // `::` 는 `:` 보다 먼저 체크.
    if (key.startsWith('::')) return { kind: 'pseudo-element', raw: key };
    if (key.startsWith(':')) return { kind: 'pseudo', raw: key };
    if (key.startsWith('@')) return { kind: 'at-rule', raw: key };
    if (key.startsWith('[')) return { kind: 'attr', raw: key };
    if (key.startsWith('&')) return { kind: 'self-ref', raw: key };

    throw new Error(
        `invalid selector: ${JSON.stringify(key)}. ` +
            `Nested keys must start with ':', '::', '@', '[', or '&'.`,
    );
}

/**
 * CSS selector 에서 top-level 콤마로 분기 selector 분리.
 * 괄호 `()` / 대괄호 `[]` 안의 콤마는 무시한다 — `[data-a="x,y"]`, `:is(a, b)`
 * 같은 selector 안의 콤마를 split 경계로 쓰면 안 되기 때문.
 *
 * 리뷰 #4 결함:
 *   `':hover, :focus-visible'` → `.x:hover, :focus-visible`
 *   (뒷 branch 에 class prefix 가 빠져 전역 selector 로 유출)
 * 를 막기 위해 emit 단계에서 각 branch 에 class prefix 를 붙인다.
 */
function splitTopLevelCommas(s: string): string[] {
    const parts: string[] = [];
    let paren = 0;
    let bracket = 0;
    let last = 0;

    for (let i = 0; i < s.length; i++) {
        const c = s[i];
        if (c === '(') paren++;
        else if (c === ')') paren--;
        else if (c === '[') bracket++;
        else if (c === ']') bracket--;
        else if (c === ',' && paren === 0 && bracket === 0) {
            parts.push(s.slice(last, i));
            last = i + 1;
        }
    }
    parts.push(s.slice(last));
    return parts.map((p) => p.trim()).filter(Boolean);
}

export function composeSelector(className: string, key: string): string {
    // top-level comma 가 있으면 branch 마다 class prefix 를 붙여 재조립.
    const branches = splitTopLevelCommas(key);
    if (branches.length > 1) {
        return branches.map((b) => composeSelector(className, b)).join(', ');
    }

    const parsed = parseSelector(key);

    // self-ref 는 "현재 selector 를 이 위치에 삽입" 의미. key 안의 `&` 를
    // className 으로 모두 치환한다. 중첩 pseudo 안의 `&.active` 처럼 kind 가
    // pseudo 로 판정되어도 key 중간의 `&` 를 놓치지 않기 위해, 치환은 kind 판정과
    // 독립적으로 먼저 수행한다.
    const replaced = key.includes('&') ? key.replace(/&/g, className) : key;

    switch (parsed.kind) {
        case 'self-ref':
            return replaced;
        case 'pseudo':
        case 'pseudo-element':
        case 'attr':
            // `&` 가 중간에 있으면 그 부분이 className 으로 치환된 replaced 사용.
            return key.includes('&') ? replaced : `${className}${key}`;
        case 'at-rule':
            return className;
    }
}

/** CSS 공백 문자(space/tab/LF/CR/FF)만 하나로 축약 후 양끝 공백 제거. */
function normalizeWhitespace(s: string): string {
    return s.replace(/[ \t\n\r\f]+/g, ' ').trim();
}

/**
 * selectorContext 합성. canonical 규약:
 *
 *   `@at-rule 1@at-rule 2...<pseudo/attr/self-ref 체인>`
 *
 * 즉, at-rule 접두가 항상 selector 체인 **앞**에 나타난다. 사용자가
 * `:hover` 아래에 `@media` 를 중첩해도 합성 결과는 `@media:hover` 로 뒤바꿔
 * 저장한다. 이렇게 하면 emit 단계의 `extractAtRulePrefix` 가 복잡한 역검색
 * 없이 접두어만 떼어내도 되고, 결과 CSS 는 `@media (...) { .x:hover {...} }`
 * 로 올바르게 wrap 된다 — 리뷰 #3 결함(`\.x:hover@media (...)` 유출) 방지.
 */
export function composeContext(parent: string, key: string): string {
    const parsed = parseSelector(key);
    const norm = parsed.kind === 'at-rule' ? normalizeWhitespace(key) : key;
    if (parent === 'base') return norm;

    if (parsed.kind === 'at-rule') {
        // at-rule 은 항상 selector 체인 앞. parent 가 at-rule 로 시작하면 그 뒤에
        // 이어 쌓고, 아니면 selector 체인 앞으로 당긴다.
        return parent.startsWith('@') ? `${parent}${norm}` : `${norm}${parent}`;
    }

    return `${parent}${norm}`;
}
