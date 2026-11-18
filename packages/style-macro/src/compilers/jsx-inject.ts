import type MagicString from 'magic-string';

import type { AnyProp, BuildError } from '~/models/types';

import { locOfNode } from './loc';

/**
 * 한 css() 호출이 element `style` 에 넣을 slot 값. className 이 고르는 분기 트리와
 * 같은 모양이다 — 분기 leaf 마다 그 leaf 의 블록이 실제로 참조하는 slot 만 담는다.
 * 그래서 slot 식은 className 이 그 분기를 고를 때만 평가된다.
 */
export type SlotTree =
    | { kind: 'obj'; entries: string[] }
    | { kind: 'cond'; test: () => string; whenTrue: SlotTree; whenFalse: SlotTree };

export const EMPTY_SLOTS: SlotTree = { kind: 'obj', entries: [] };

export interface DynamicCallSite {
    /** call node (CallExpression). */
    call: AnyProp;
    /** `locateJsx` 결과. */
    found: FoundJsx;
    /**
     * `found.guards` 와 같은 순서의 조건 식(style 쪽에서 읽을 원문). 조건 원문을 그대로 쓰거나,
     * 임시 변수 이름·대입식을 쓴다 (`./memo`).
     */
    guardTests: (() => string)[];
    /** 호출 인자의 분기 트리를 따라 만든 slot 트리. */
    slots: SlotTree;
}

interface PendingInject {
    openingEl: AnyProp;
    trees: SlotTree[];
}

export interface InjectContext {
    ms: MagicString;
    /** openingEl.start → 해당 element 로 모인 slot 트리. flushInjects 가 소비. */
    pending: Map<number, PendingInject>;
    /** flush 가 쓴 runtime helper 이름 (`_mergeStyle`, `_withStyle`). */
    helpers: Set<string>;
    /** flush 중 발견한 빌드 에러. */
    errors: BuildError[];
}

export interface InjectOutcome {
    success: boolean;
    error?: BuildError;
}

const WRAPPER_TYPES = new Set([
    'CallExpression',
    'ConditionalExpression',
    'LogicalExpression',
    'SequenceExpression',
    'ParenthesizedExpression',
    'TSAsExpression',
    'TSNonNullExpression',
    'TSSatisfiesExpression',
    'TemplateLiteral',
    'TaggedTemplateExpression',
    'SpreadElement',
    'ArrayExpression',
]);

/**
 * call 의 조상 체인을 훑어 `<Foo className={...}>` 위치를 찾고 slot 트리를 pending 버킷에
 * 누적. call 을 감싼 조건(`a && css()`, `t ? css() : …`)은 트리 바깥 분기로 덧씌운다 —
 * 호출 인자 안의 분기와 같은 방식이라, slot 은 call 이 평가될 때만 평가된다.
 * 실제 삽입은 `flushInjects` 가 모든 call 수집 후 element 단위로 한 번에 처리.
 */
export function injectJsxStyleForCall(site: DynamicCallSite, ctx: InjectContext): InjectOutcome {
    const { openingEl, guards } = site.found;

    // 문자열 style(`style="…"`)은 React 에서도 유효하지 않고 합칠 수 없다.
    for (const a of openingEl.attributes as AnyProp[]) {
        if (!isStyleAttr(a)) continue;
        const v = a.value;
        if (v && !(v.type === 'JSXExpressionContainer' && v.expression)) {
            return {
                success: false,
                error: mkErr(ctx.ms.original, site.call, 'style-unmergeable'),
            };
        }
    }

    // guards 는 바깥 → 안쪽. 안쪽부터 감싸야 바깥 조건이 가장 먼저 평가된다.
    const tree = guards.reduceRight<SlotTree>(
        (inner, g, i) => ({
            kind: 'cond',
            test: () => guardTest(g, site.guardTests[i]!()),
            whenTrue: inner,
            whenFalse: EMPTY_SLOTS,
        }),
        site.slots,
    );

    const key = openingEl.start;
    const existing = ctx.pending.get(key);
    if (existing) {
        existing.trees.push(tree);
    } else {
        ctx.pending.set(key, { openingEl, trees: [tree] });
    }
    return { success: true };
}

/** 트리 하나를 object 식으로. 조건 원문은 이 시점에 읽어 다른 css() 치환이 반영된다. */
function renderTree(tree: SlotTree): string {
    if (tree.kind === 'obj') {
        return tree.entries.length ? `{ ${tree.entries.join(', ')} }` : '{}';
    }
    return `(${tree.test()} ? ${renderTree(tree.whenTrue)} : ${renderTree(tree.whenFalse)})`;
}

/** element 의 style object 본문. 분기 없는 트리는 펼치고, 분기 트리는 spread 한다. */
function renderEntries(trees: SlotTree[]): string[] {
    return trees.flatMap((t) => (t.kind === 'obj' ? t.entries : [`...${renderTree(t)}`]));
}

/**
 * pending 버킷을 MagicString 에 반영. opening element 당 한 번.
 *
 * slot 은 element 가 **최종적으로 받는** `style` 과 합쳐야 한다. JSX 는 뒤 속성이 이기고
 * spread 도 `style` 을 실어 올 수 있으며, 값이 함수(stateful callback)일 수도 있다. 그래서
 * 최종 값을 어디서 읽을지만 문법으로 정하고, 합치기는 런타임 helper 가 값으로 한다.
 * - style 출처가 없음: 합칠 대상이 없으니 `style={slots}` 를 붙인다.
 * - 명시 `style` 하나뿐: 그 값이 최종이다 → `style={_mergeStyle(slots, (값))}`.
 * - spread 가 있음(또는 style 이 여러 번): 최종 값은 런타임에만 정해진다 → 속성 전체를 원래
 *   순서 그대로 한 객체로 모아 `{..._withStyle(slots, { … })}` 로 바꾼다. 각 식은 한 번만
 *   평가된다. `key` 는 spread 에 넣으면 React 가 경고하므로 명시 속성으로 앞에 둔다.
 */
export function flushInjects(ctx: InjectContext): void {
    for (const p of ctx.pending.values()) {
        const entries = renderEntries(p.trees);
        if (entries.length === 0) continue;
        const slotObj = `{ ${entries.join(', ')} }`;
        const attrs = p.openingEl.attributes as AnyProp[];
        const sources = attrs.filter((a) => isStyleAttr(a) || a.type === 'JSXSpreadAttribute');

        if (sources.length === 0) {
            ctx.ms.appendLeft(findAttributeInsertPos(p.openingEl), ` style={${slotObj}}`);
            continue;
        }

        if (sources.length === 1 && isStyleAttr(sources[0])) {
            const value = sources[0].value;
            const user = value
                ? `(${ctx.ms.slice(value.expression.start, value.expression.end)})`
                : 'true';
            ctx.helpers.add('_mergeStyle');
            if (value)
                ctx.ms.overwrite(
                    value.expression.start,
                    value.expression.end,
                    `_mergeStyle(${slotObj}, ${user})`,
                );
            else ctx.ms.appendLeft(sources[0].end, `={_mergeStyle(${slotObj}, undefined)}`);
            continue;
        }

        // 최종 style 이 갈리는 구간은 첫 style 출처부터 마지막 출처까지다. 그 앞뒤 속성은 style 을
        // 바꿀 수 없으므로 JSX 속성 그대로 두고, 구간만 같은 위치의 spread 하나로 바꾼다.
        const from = attrs.indexOf(sources[0]);
        const to = attrs.indexOf(sources[sources.length - 1]);
        const region = attrs.slice(from, to + 1);
        const keyAttr = region.find((a) => a.type === 'JSXAttribute' && attrName(a) === 'key');
        const props: string[] = [];
        for (const a of region) {
            if (a === keyAttr) continue;
            const entry = propEntry(a, ctx.ms);
            if (entry === null)
                return void ctx.errors.push(mkErr(ctx.ms.original, a, 'entity-in-spread-region'));
            props.push(entry);
        }
        const key = keyAttr ? `${ctx.ms.slice(keyAttr.start, keyAttr.end)} ` : '';
        ctx.helpers.add('_withStyle');
        ctx.ms.overwrite(
            region[0].start,
            region[region.length - 1].end,
            `${key}{..._withStyle(${slotObj}, { ${props.join(', ')} })}`,
        );
    }
}

function isStyleAttr(a: AnyProp): boolean {
    return a?.type === 'JSXAttribute' && attrName(a) === 'style';
}

function attrName(a: AnyProp): string {
    const n = a.name;
    if (n?.type === 'JSXNamespacedName') return `${n.namespace.name}:${n.name.name}`;
    return n?.name;
}

/**
 * JSX 속성 하나 → 같은 값을 만드는 object 항목. 값 원문은 다른 css() 치환이 반영된 것을 읽는다.
 * JSX 문자열은 HTML entity 를 해석하는데 파서는 해석 전 값만 준다 — entity 가 든 문자열은
 * JS 문자열로 옮기면 값이 바뀌므로 `null`(호출 측이 빌드 에러로 알림).
 */
function propEntry(a: AnyProp, ms: MagicString): string | null {
    if (a.type === 'JSXSpreadAttribute') {
        return `...${ms.slice(a.argument.start, a.argument.end)}`;
    }
    const key = JSON.stringify(attrName(a));
    const v = a.value;
    if (!v) return `${key}: true`;
    if (v.type === 'Literal' || v.type === 'StringLiteral') {
        return v.value.includes('&') ? null : `${key}: ${JSON.stringify(v.value)}`;
    }
    if (v.type === 'JSXExpressionContainer') {
        return `${key}: ${ms.slice(v.expression.start, v.expression.end)}`;
    }
    return `${key}: ${ms.slice(v.start, v.end)}`;
}

/**
 * call 을 감싼 조건 중 call 의 평가 여부를 결정하는 조건 하나.
 * - `truthy`: `test && call`, `test ? call : …`
 * - `falsy`: `test || call`, `test ? … : call`
 * - `nullish`: `test ?? call`
 */
export interface Guard {
    test: AnyProp;
    when: 'truthy' | 'falsy' | 'nullish';
}

function guardTest({ when }: Guard, test: string): string {
    const t = `(${test})`;
    if (when === 'truthy') return t;
    if (when === 'falsy') return `!${t}`;
    return `${t} == null`;
}

/** `parent` 안에서 `child` 위치가 평가 조건을 거는지. 조건 없으면 `null`. */
function guardOf(parent: AnyProp, child: AnyProp): Guard | null {
    if (parent.type === 'ConditionalExpression') {
        if (parent.consequent === child) return { test: parent.test, when: 'truthy' };
        if (parent.alternate === child) return { test: parent.test, when: 'falsy' };
        return null;
    }
    if (parent.type === 'LogicalExpression' && parent.right === child) {
        if (parent.operator === '&&') return { test: parent.left, when: 'truthy' };
        if (parent.operator === '||') return { test: parent.left, when: 'falsy' };
        if (parent.operator === '??') return { test: parent.left, when: 'nullish' };
    }
    return null;
}

export interface FoundJsx {
    openingEl: AnyProp;
    /** call 이 들어 있는 `className` 속성. */
    classAttr: AnyProp;
    /** 바깥 → 안쪽. */
    guards: Guard[];
}

/**
 * element 의 slot(style) 식이 className 식보다 먼저 평가되는지. slot 은 첫 style 출처
 * (`style` 속성 또는 spread) 자리에서 평가되고, 출처가 없으면 마지막 속성 뒤에 붙는다
 * (`flushInjects`). JSX 속성은 적힌 순서대로 평가된다.
 */
export function slotsEvaluateFirst({ openingEl, classAttr }: FoundJsx): boolean {
    const attrs = openingEl.attributes as AnyProp[];
    const firstSource = attrs.findIndex((a) => isStyleAttr(a) || a.type === 'JSXSpreadAttribute');
    return firstSource !== -1 && firstSource < attrs.indexOf(classAttr);
}

/** call 을 담은 `className={...}` 의 element 와 call 을 감싼 조건들. */
export function locateJsx(
    source: string,
    _call: AnyProp,
    parents: AnyProp[],
): FoundJsx | { error: BuildError } {
    // parents 는 walker 가 자식→부모 순으로 push 하고 pop 하는 스택 뒤로 push된 상태.
    // parents[len-1] 이 call 의 직계 부모. 위로 올라가며 JSXExpressionContainer 를 찾음.
    let i = parents.length - 1;
    let child = _call;
    // 안쪽 → 바깥 순으로 쌓인다. 반환 시 뒤집는다.
    const guards: Guard[] = [];
    // 중간 wrapper 는 통과.
    while (i >= 0) {
        const n = parents[i];
        if (!n) break;
        if (n.type === 'JSXExpressionContainer') {
            // JSXExpressionContainer 의 부모는 JSXAttribute.
            const attr = parents[i - 1];
            if (!attr || attr.type !== 'JSXAttribute')
                return { error: mkErr(source, _call, 'no-attr') };
            const nameNode = attr.name;
            if (!nameNode || nameNode.type !== 'JSXIdentifier' || nameNode.name !== 'className') {
                return { error: mkErr(source, _call, 'not-className') };
            }
            const openingEl = parents[i - 2];
            if (!openingEl || openingEl.type !== 'JSXOpeningElement') {
                return { error: mkErr(source, _call, 'no-opening') };
            }
            return { openingEl, classAttr: attr, guards: guards.reverse() };
        }
        if (!WRAPPER_TYPES.has(n.type)) {
            return { error: mkErr(source, _call, `unwrap:${n.type}`) };
        }
        const guard = guardOf(n, child);
        if (guard) guards.push(guard);
        child = n;
        i--;
    }
    return { error: mkErr(source, _call, 'no-jsx') };
}

function findAttributeInsertPos(openingEl: AnyProp): number {
    // opening element 의 마지막 attribute 뒤 (또는 tag 이름 뒤) 에 삽입.
    const attrs = openingEl.attributes as AnyProp[];
    if (attrs.length > 0) {
        const last = attrs[attrs.length - 1];
        return last.end;
    }
    // fallback: openingElement start + tagName 뒤. name node end 사용.
    const name = openingEl.name;
    return name?.end ?? openingEl.start + 1;
}

function mkErr(source: string, call: AnyProp, tag: string): BuildError {
    if (tag === 'entity-in-spread-region') {
        return {
            code: 'dynamic-value',
            message:
                'This element has dynamic css() values and spread props, so its attributes between the ' +
                'spreads are rewritten as JavaScript, where HTML entities in a JSX string are not decoded. ' +
                "Write the value as an expression instead, e.g. title={'a & b'}.",
            loc: locOfNode(source, call),
        };
    }
    return {
        code: 'dynamic-value',
        message: `Dynamic css() call must sit in a JSX className={...} position (detail: ${tag}).`,
        loc: locOfNode(source, call),
    };
}
