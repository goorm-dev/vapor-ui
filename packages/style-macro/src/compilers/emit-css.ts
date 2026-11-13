import { type ClassNameMode, buildClassName, dynamicVarName } from '~/models/class-name';
import { composeSelector } from '~/models/selector';
import { bucketOf, bucketRank, compareAtRulePath, innerRank } from '~/models/sort';
import type { IRRule } from '~/models/types';

export interface EmitOutput {
    /** 방출된 CSS 전문. `@layer <layer> { ... }` 블록 (기본 `vapor-utilities`). */
    cssText: string;
    /** rules 와 같은 순서·길이의 className. dedupe 를 통과한 뒤 재분배. */
    classNamesPerRule: string[];
    /** dynamic slot 목록 (P4 에서 쓰임). */
    dynamicSlots: Array<{ slotId: string; sourceExpr: string; property: string }>;
}

interface Emitted {
    cssRule: string;
    atRulePath: string[];
    bucket: number;
    inner: number;
    order: number;
}

/**
 * selectorContext 에서 앞쪽 at-rule 접두어와 leaf selector 분리.
 * 괄호 depth 0 에서 `:`, `[`, `&` 가 나오면 거기부터 leaf. 그 전까지는 at-rule 영역.
 * 복합 미디어 쿼리(`@media (min-width: 768px) and (max-width: 1024px)`) 와
 * 컨테이너 쿼리(`@container sidebar (min-width: 400px)`) 가 하나의 at-rule 로 유지됨.
 */
function extractAtRulePrefix(selectorContext: string) {
    if (!selectorContext.startsWith('@')) {
        return { atRule: null, leaf: selectorContext || 'base' };
    }

    let depth = 0;
    let prefixEnd = selectorContext.length;

    for (let i = 0; i < selectorContext.length; i++) {
        const c = selectorContext[i];
        if (c === '(') depth++;
        else if (c === ')') depth--;
        else if (depth === 0 && (c === ':' || c === '[' || c === '&')) {
            prefixEnd = i;
            break;
        }
    }

    const atRule = selectorContext.slice(0, prefixEnd).trim();
    const leaf = selectorContext.slice(prefixEnd) || 'base';
    return { atRule: atRule || null, leaf };
}

/** `@` 문자(괄호 밖) 기준으로 at-rule 유닛 분리. 괄호 안의 feature 는 유닛 경계로 사용하지 않음. */
function splitAtRules(prefix: string): string[] {
    const units: string[] = [];
    let depth = 0;
    let start = -1;

    for (let i = 0; i < prefix.length; i++) {
        const c = prefix[i];
        if (c === '(') depth++;
        else if (c === ')') depth--;
        else if (c === '@' && depth === 0) {
            if (start !== -1) units.push(prefix.slice(start, i).trim());
            start = i;
        }
    }

    if (start !== -1) units.push(prefix.slice(start).trim());
    return units.filter(Boolean);
}

/** 공백 생략형(`@media(min-width:768px)`) 을 정식 표기로 보정. 이미 공백이 있으면 멱등. */
function formatAtRule(s: string): string {
    return s.replace(/@([a-zA-Z-]+)(?=\()/g, '@$1 ').replace(/([a-zA-Z-]+):(?=\S)/g, '$1: ');
}

function ruleKey(r: IRRule): string {
    if (r.kind === 'static') return `s|${r.selectorContext}|${r.property}|${r.value}`;
    return `d|${r.selectorContext}|${r.property}|${r.slotId}`;
}

export const DEFAULT_LAYER = 'vapor-utilities';

export function emitCss(
    rules: IRRule[],
    mode: ClassNameMode = 'readable',
    layer: string = DEFAULT_LAYER,
): EmitOutput {
    const classNamesPerRule: string[] = [];
    const dynamicSlots: EmitOutput['dynamicSlots'] = [];
    const seen = new Map<string, string>();
    const emitted: Emitted[] = [];
    const hashMode: 'dev' | 'prod' = mode === 'hashed' ? 'prod' : 'dev';

    for (const rule of rules) {
        const dedupKey = ruleKey(rule);
        let cls = seen.get(dedupKey);

        if (!cls) {
            const finalValue =
                rule.kind === 'static'
                    ? rule.value
                    : `var(${dynamicVarName(rule.slotId, hashMode)})`;
            const rawValue = rule.kind === 'static' ? rule.rawValue : rule.sourceExpr;

            cls = buildClassName(
                {
                    property: rule.property,
                    value: finalValue,
                    rawValue,
                    selectorContext: rule.selectorContext,
                },
                mode,
            );
            seen.set(dedupKey, cls);

            const { atRule, leaf } = extractAtRulePrefix(rule.selectorContext);
            const selector = leaf === 'base' ? `.${cls}` : composeSelector(`.${cls}`, leaf);
            const cssRule = `${selector} { ${rule.property}: ${finalValue} }`;
            const atRulePath = atRule ? splitAtRules(atRule).map(formatAtRule) : [];
            emitted.push({
                cssRule,
                atRulePath,
                bucket: bucketRank(bucketOf(leaf, atRulePath.length > 0, rule.property)),
                inner: innerRank(leaf, rule.property),
                order: emitted.length,
            });

            if (rule.kind === 'dynamic') {
                dynamicSlots.push({
                    slotId: rule.slotId,
                    sourceExpr: rule.sourceExpr,
                    property: rule.property,
                });
            }
        }
        classNamesPerRule.push(cls);
    }

    const chunks: string[] = [`@layer ${layer};`, ''];

    // dynamic slot CSS var 는 기본적으로 자식에게 상속된다. 같은 class 를
    // 가진 중첩 element 라도 부모가 slot 값을 세팅하면 자식도 그대로 그려지는
    // 리뷰 #6c 결함을 막으려면 상속을 명시적으로 차단해야 한다. @property 를
    // @layer 바깥에 둬 미지원 브라우저가 레이어 자체를 날려버리지 않도록 한다.
    for (const slot of dynamicSlots) {
        const varName = dynamicVarName(slot.slotId, hashMode);
        chunks.push(`@property ${varName} { syntax: '*'; inherits: false; }`);
    }
    if (dynamicSlots.length > 0) chunks.push('');

    chunks.push(`@layer ${layer} {`);

    // Compiled 의 단일 시트 정렬. 이 함수는 (수집기를 통해) 프로젝트 전체 룰을
    // 한 번에 받으므로 여기서 정한 순서가 곧 최종 cascade 다:
    //  1) bucket — shorthand 깊이 < longhand < LVFHA pseudo < at-rule
    //  2) at-rule 끼리 — 이름 → 조건 수 → min 오름 / max 내림 (mobile-first)
    //  3) at-rule 안에서 shorthand 깊이 → pseudo → 나머지
    //  4) 그래도 같으면 입력 순서 (안정 정렬)
    const sorted = emitted.slice().sort((a, b) => {
        if (a.bucket !== b.bucket) return a.bucket - b.bucket;
        const c = compareAtRulePath(a.atRulePath, b.atRulePath);
        if (c !== 0) return c;
        if (a.inner !== b.inner) return a.inner - b.inner;
        return a.order - b.order;
    });

    // 같은 at-rule 경로는 인접하므로 연속 구간만 하나의 블록으로 묶는다.
    const openPath: string[] = [];
    const closeTo = (depth: number) => {
        while (openPath.length > depth) {
            openPath.pop();
            chunks.push(`${'  '.repeat(openPath.length + 1)}}`);
        }
    };
    for (const e of sorted) {
        let common = 0;
        while (
            common < openPath.length &&
            common < e.atRulePath.length &&
            openPath[common] === e.atRulePath[common]
        ) {
            common++;
        }
        closeTo(common);
        while (openPath.length < e.atRulePath.length) {
            const p = e.atRulePath[openPath.length];
            chunks.push(`${'  '.repeat(openPath.length + 1)}${p} {`);
            openPath.push(p);
        }
        chunks.push(`${'  '.repeat(openPath.length + 1)}${e.cssRule}`);
    }
    closeTo(0);
    chunks.push('}');

    return { cssText: chunks.join('\n'), classNamesPerRule, dynamicSlots };
}
