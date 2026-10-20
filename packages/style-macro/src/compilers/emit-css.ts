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

    // base 그룹(pathKey === '') 을 at-rule 그룹보다 먼저 emit.
    // 같은 layer, 같은 specificity라서 뒤에 나오는 규칙이 이긴다. base가 뒤면
    // `css({ '@media (...)': { padding: 8 }, padding: 4 })` 에서 media 규칙이 base 로 덮인다.
    const entries = Array.from(grouped.entries()).sort(([a], [b]) =>
        a === '' ? -1 : b === '' ? 1 : 0,
    );

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
