import { type ClassNameMode, dynamicVarName } from '~/models/class-name';
import { composeSelector } from '~/models/selector';
import { compareAtRulePath } from '~/models/sort';
import type { IRRule } from '~/models/types';

export const DEFAULT_LAYER = 'vapor-utilities';

/** `css()` 호출 1개(또는 삼항 분기 1개)가 만드는 class 와 그 선언. */
export interface Block {
    className: string;
    rules: IRRule[];
}

export interface EmitOptions {
    mode: ClassNameMode;
    /** 규칙을 담을 cascade layer. 기본 `vapor-utilities`. */
    layer?: string;
}

export interface EmitOutput {
    /** 모듈 CSS 전문. 블록이 없으면 빈 문자열. */
    cssText: string;
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

function slotKey(r: IRRule): string {
    return `${r.selectorContext}|${r.property}`;
}

/**
 * 같은 selector 컨텍스트·property 는 마지막 선언만 남기고, 그 마지막 위치로 옮긴다.
 * 블록 안 선언 순서가 곧 cascade 순서이므로 "뒤에 쓴 것이 이긴다" 를 그대로 보존한다.
 */
export function normalizeRules(rules: IRRule[]): IRRule[] {
    const seen = new Set<string>();
    const out: IRRule[] = [];
    for (let i = rules.length - 1; i >= 0; i--) {
        const key = slotKey(rules[i]);
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(rules[i]);
    }
    return out.reverse();
}

/** class 이름 해시 입력. 선언 순서·값·slot 을 모두 반영한다. */
export function signatureOf(rules: IRRule[]): string {
    return rules
        .map((r) =>
            r.kind === 'static' ? `${slotKey(r)}:${r.value}` : `${slotKey(r)}:$slot(${r.slotId})`,
        )
        .join(';');
}

interface Group {
    atRulePath: string[];
    selector: string;
    decls: string[];
    order: number;
}

function groupsOf(block: Block, hashMode: 'dev' | 'prod'): Group[] {
    const byKey = new Map<string, Group>();
    for (const rule of block.rules) {
        const { atRule, leaf } = extractAtRulePrefix(rule.selectorContext);
        const atRulePath = atRule ? splitAtRules(atRule).map(formatAtRule) : [];
        const cls = `.${block.className}`;
        const selector = leaf === 'base' ? cls : composeSelector(cls, leaf);
        const key = `${atRulePath.join('\u0000')}\u0001${selector}`;
        let g = byKey.get(key);
        if (!g) {
            g = { atRulePath, selector, decls: [], order: byKey.size };
            byKey.set(key, g);
        }
        const value =
            rule.kind === 'static' ? rule.value : `var(${dynamicVarName(rule.slotId, hashMode)})`;
        g.decls.push(`${rule.property}: ${value};`);
    }

    // base selector 그룹 → 중첩 selector 그룹 (등장 순) → at-rule 그룹 (min 오름 / max 내림).
    const base = `.${block.className}`;
    return [...byKey.values()].sort((a, b) => {
        const aAt = a.atRulePath.length > 0;
        const bAt = b.atRulePath.length > 0;
        if (aAt !== bAt) return aAt ? 1 : -1;
        if (aAt) {
            const c = compareAtRulePath(a.atRulePath, b.atRulePath);
            if (c !== 0) return c;
        }
        const aBase = a.selector === base;
        const bBase = b.selector === base;
        if (aBase !== bBase) return aBase ? -1 : 1;
        return a.order - b.order;
    });
}

/**
 * 블록 목록을 모듈 CSS 로. 블록은 입력 순서대로 쓰고, 같은 class 가 다시 나오면 건너뛴다.
 * dynamic slot 의 `@property` 선언은 레이어 밖, 앞에 한 번만 둔다 — 미지원 브라우저가
 * 레이어 블록 전체를 버리지 않도록 하고, slot 값이 자식에게 상속되지 않게 한다.
 */
export function emitBlocks(blocks: Block[], opts: EmitOptions): EmitOutput {
    const layer = opts.layer ?? DEFAULT_LAYER;
    const hashMode: 'dev' | 'prod' = opts.mode === 'hashed' ? 'prod' : 'dev';

    const seenClass = new Set<string>();
    const slots = new Set<string>();
    const body: string[] = [];

    for (const block of blocks) {
        if (seenClass.has(block.className) || block.rules.length === 0) continue;
        seenClass.add(block.className);
        for (const r of block.rules) if (r.kind === 'dynamic') slots.add(r.slotId);

        const openPath: string[] = [];
        const indent = () => '  '.repeat(openPath.length + 1);
        const closeTo = (depth: number) => {
            while (openPath.length > depth) {
                openPath.pop();
                body.push(`${indent()}}`);
            }
        };
        for (const g of groupsOf(block, hashMode)) {
            let common = 0;
            while (
                common < openPath.length &&
                common < g.atRulePath.length &&
                openPath[common] === g.atRulePath[common]
            ) {
                common++;
            }
            closeTo(common);
            while (openPath.length < g.atRulePath.length) {
                const p = g.atRulePath[openPath.length];
                body.push(`${indent()}${p} {`);
                openPath.push(p);
            }
            body.push(`${indent()}${g.selector} { ${g.decls.join(' ')} }`);
        }
        closeTo(0);
    }

    if (body.length === 0) return { cssText: '' };

    const chunks = [`@layer ${layer};`];
    for (const slotId of slots) {
        chunks.push(
            `@property ${dynamicVarName(slotId, hashMode)} { syntax: '*'; inherits: false; }`,
        );
    }
    chunks.push(`@layer ${layer} {`, ...body, '}');
    return { cssText: chunks.join('\n') };
}
