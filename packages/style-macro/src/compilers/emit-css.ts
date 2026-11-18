import { type ClassNameMode, dynamicVarName } from '~/models/class-name';
import { contextKey, resolveSelector } from '~/models/selector';
import { orderAtRulePaths } from '~/models/sort';
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

function slotKey(r: IRRule): string {
    return `${contextKey(r.context)}|${r.property}`;
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
    atRulePath: readonly string[];
    selector: string;
    decls: string[];
    order: number;
}

function groupsOf(block: Block, hashMode: 'dev' | 'prod'): Group[] {
    const byKey = new Map<string, Group>();
    for (const rule of block.rules) {
        // prelude 는 작성한 그대로 낸다 (공백 축약만 `nestContext` 가 한다). `selector(a:hover)` 처럼
        // `:` 가 문법의 일부인 곳이 있어 텍스트를 고쳐 쓰면 의미가 바뀐다.
        const atRulePath = rule.context.atRules;
        const selector = resolveSelector(rule.context.selector, block.className);
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

    // base selector 그룹 → 중첩 selector 그룹 (등장 순) → at-rule 그룹. at-rule 그룹은 path 별로
    // 묶어 작성 순으로 두고 width media query 만 그 자리들 안에서 정렬한다 (`orderAtRulePaths`).
    // 같은 path 안에서는 base selector 먼저, 그다음 등장 순.
    const base = `.${block.className}`;
    const baseFirst = (a: Group, b: Group) =>
        Number(b.selector === base) - Number(a.selector === base) || a.order - b.order;

    const all = [...byKey.values()];
    const plain = all.filter((g) => g.atRulePath.length === 0).sort(baseFirst);
    const byPath = new Map<string, Group[]>();
    for (const g of all) {
        if (g.atRulePath.length === 0) continue;
        const key = g.atRulePath.join('\u0000');
        byPath.set(key, [...(byPath.get(key) ?? []), g]);
    }
    const buckets = orderAtRulePaths([...byPath.values()].map((gs) => gs[0]!.atRulePath));
    const ordered = buckets.flatMap((path) => byPath.get(path.join('\u0000'))!.sort(baseFirst));
    return [...plain, ...ordered];
}

/**
 * 블록 목록을 모듈 CSS 로. 블록은 입력 순서대로 쓰고, 같은 class 가 다시 나오면 건너뛴다.
 *
 * dynamic slot 변수는 등록(`@property`)하지 않아 일반 custom property 처럼 상속된다 —
 * `::before`·`& > span` 같은 중첩 selector 가 element 에 설정된 slot 을 읽으려면 상속이
 * 필요하다. 같은 class 가 중첩될 때 부모 값이 새지 않는 것은 inline style 쪽이 보장한다:
 * 이 class 를 가진 element 는 항상 자기 slot 을 설정하고, 값이 없으면 `var(--x,)`
 * 자기 참조(cycle)로 guaranteed-invalid 가 된다 (`transform.ts` `#slotEntry`).
 */
export function emitBlocks(blocks: Block[], opts: EmitOptions): EmitOutput {
    const layer = opts.layer ?? DEFAULT_LAYER;
    const hashMode: 'dev' | 'prod' = opts.mode === 'hashed' ? 'prod' : 'dev';

    const seenClass = new Set<string>();
    const body: string[] = [];

    for (const block of blocks) {
        if (seenClass.has(block.className) || block.rules.length === 0) continue;
        seenClass.add(block.className);

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

    return { cssText: [`@layer ${layer};`, `@layer ${layer} {`, ...body, '}'].join('\n') };
}
