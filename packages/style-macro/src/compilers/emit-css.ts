import { type ClassNameMode, buildClassName, dynamicVarName } from '~/models/class-name';
import { composeSelector } from '~/models/selector';
import type { IRRule } from '~/models/types';

export interface EmitOutput {
    /** 방출된 CSS 전문. `@layer vapor-utilities { ... }` 블록. */
    cssText: string;
    /** rules 와 같은 순서·길이의 className. dedupe 를 통과한 뒤 재분배. */
    classNamesPerRule: string[];
    /** dynamic slot 목록 (P4 에서 쓰임). */
    dynamicSlots: Array<{ slotId: string; sourceExpr: string; property: string }>;
}

interface Emitted {
    cssRule: string;
    atRulePath: string[];
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

export function emitCss(rules: IRRule[], mode: ClassNameMode = 'readable'): EmitOutput {
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
            emitted.push({ cssRule, atRulePath });

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

    const grouped = new Map<string, string[]>();
    for (const { cssRule, atRulePath } of emitted) {
        const key = atRulePath.join('|');
        const arr = grouped.get(key) ?? [];
        arr.push(cssRule);
        grouped.set(key, arr);
    }

    const chunks: string[] = ['@layer vapor-utilities;', '', '@layer vapor-utilities {'];

    // 그룹 출력 순서는 cascade 결과를 좌우한다. 같은 layer·같은 specificity 는
    // 뒤에 등장한 규칙이 이기므로 작성자 의도와 다른 미디어 쿼리가 적용될 수 있다.
    //  1) base 그룹(`pathKey === ''`)을 가장 먼저. 그렇지 않으면 base 가 뒤에서
    //     at-rule override 를 덮는다.
    //  2) at-rule 그룹끼리는 `min-width` 오름차순으로 결정적 정렬. mobile-first
    //     가정하에서 좁은 뷰포트 규칙이 먼저 나와 넓은 뷰포트 규칙이 cascade 로
    //     이기는 상태를 보장한다. `min-width` 가 없는 그룹은 뒤에 stable sort.
    //  3) 결정성 보강을 위해 숫자가 같거나 min-width 가 모두 없으면 pathKey
    //     문자열 사전식으로 tie-break.
    //
    // chunk(파일/CSS 조각) 간 순서는 번들러가 결정한다. 이 함수는 한 파일 내부
    // 결정성만 책임지므로, 소비자가 여러 파일에 @media 를 흩어 두면 min-width 역순
    // 이슈가 재현될 수 있다. mobile-first 작성과 파일 분리 최소화를 권장한다.
    const MIN_WIDTH_RE = /\(\s*min-width\s*:\s*([\d.]+)\s*(px|em|rem)?\s*\)/i;
    const minWidthOf = (key: string): number | null => {
        const m = MIN_WIDTH_RE.exec(key);
        if (!m) return null;
        const n = Number(m[1]);
        if (!Number.isFinite(n)) return null;
        const unit = (m[2] ?? 'px').toLowerCase();
        // em·rem 은 일반 base 16px 기준으로 환산. 비교에만 쓰므로 근사면 충분.
        return unit === 'px' ? n : n * 16;
    };
    const entries = Array.from(grouped.entries()).sort(([a], [b]) => {
        if (a === b) return 0;
        if (a === '') return -1;
        if (b === '') return 1;
        const mwA = minWidthOf(a);
        const mwB = minWidthOf(b);
        if (mwA !== null && mwB !== null) {
            if (mwA !== mwB) return mwA - mwB;
        } else if (mwA !== null) {
            return -1;
        } else if (mwB !== null) {
            return 1;
        }
        return a < b ? -1 : 1;
    });

    for (const [pathKey, ruleList] of entries) {
        if (!pathKey) {
            for (const r of ruleList) chunks.push(`  ${r}`);
        } else {
            const paths = pathKey.split('|');
            let indent = '  ';
            for (const p of paths) {
                chunks.push(`${indent}${p} {`);
                indent += '  ';
            }
            for (const r of ruleList) chunks.push(`${indent}${r}`);
            for (let i = 0; i < paths.length; i++) {
                indent = indent.slice(2);
                chunks.push(`${indent}}`);
            }
        }
    }
    chunks.push('}');

    return { cssText: chunks.join('\n'), classNamesPerRule, dynamicSlots };
}
