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

/** selectorContext 에서 앞쪽 at-rule 접두어와 leaf selector 분리. */
function extractAtRulePrefix(selectorContext: string) {
    let i = 0;
    while (selectorContext[i] === '@') {
        const parenStart = selectorContext.indexOf('(', i);
        if (parenStart === -1) break;
        let depth = 0;
        let j = parenStart;
        for (; j < selectorContext.length; j++) {
            if (selectorContext[j] === '(') depth++;
            else if (selectorContext[j] === ')') {
                depth--;
                if (depth === 0) {
                    j++;
                    break;
                }
            }
        }
        i = j;
    }
    const atRule = i > 0 ? selectorContext.slice(0, i) : null;
    const leaf = selectorContext.slice(i) || 'base';
    return { atRule, leaf };
}

function splitAtRules(prefix: string): string[] {
    const units: string[] = [];
    let i = 0;
    while (i < prefix.length) {
        const start = i;
        const parenStart = prefix.indexOf('(', i);
        if (parenStart === -1) break;
        let depth = 0;
        let j = parenStart;
        for (; j < prefix.length; j++) {
            if (prefix[j] === '(') depth++;
            else if (prefix[j] === ')') {
                depth--;
                if (depth === 0) {
                    j++;
                    break;
                }
            }
        }
        units.push(prefix.slice(start, j));
        i = j;
    }
    return units;
}

/** `@media(min-width:768px)` → `@media (min-width: 768px)` */
function formatAtRule(condensed: string): string {
    return condensed.replace(/@([a-zA-Z-]+)\(/, '@$1 (').replace(/:/g, ': ');
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
    for (const [pathKey, ruleList] of Array.from(grouped.entries())) {
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
