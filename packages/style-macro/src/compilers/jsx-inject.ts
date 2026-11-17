import type MagicString from 'magic-string';

import type { AnyProp, BuildError } from '~/models/types';

/**
 * 한 css() 호출이 element `style` 에 넣을 slot 값. className 이 고르는 분기 트리와
 * 같은 모양이다 — 분기 leaf 마다 그 leaf 의 블록이 실제로 참조하는 slot 만 담는다.
 * 그래서 slot 식은 className 이 그 분기를 고를 때만 평가된다.
 */
export type SlotTree =
    | { kind: 'obj'; entries: string[] }
    | { kind: 'cond'; test: () => string; whenTrue: SlotTree; whenFalse: SlotTree };

export const EMPTY_SLOTS: SlotTree = { kind: 'obj', entries: [] };

export function hasSlots(tree: SlotTree): boolean {
    return tree.kind === 'obj'
        ? tree.entries.length > 0
        : hasSlots(tree.whenTrue) || hasSlots(tree.whenFalse);
}

export interface DynamicCallSite {
    /** call node (CallExpression). */
    call: AnyProp;
    /** parent chain at walk time (자기 자신 제외, top-down). */
    parents: AnyProp[];
    /** 호출 인자의 분기 트리를 따라 만든 slot 트리. */
    slots: SlotTree;
}

interface PendingInject {
    openingEl: AnyProp;
    attribute: AnyProp | null;
    trees: SlotTree[];
}

export interface InjectContext {
    ms: MagicString;
    /** openingEl.start → 해당 element 로 모인 slot 트리. flushInjects 가 소비. */
    pending: Map<number, PendingInject>;
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
    const found = findJsxAttribute(site.call, site.parents);
    if ('error' in found) return { success: false, error: found.error };

    const { openingEl, attribute, guards } = found;

    // 기존 style attribute 가 머지 가능한 형태인지 확인.
    if (attribute) {
        const v = attribute.value;
        if (v && !(v.type === 'JSXExpressionContainer' && v.expression)) {
            return { success: false, error: mkErr(site.call, 'style-unmergeable') };
        }
    }

    // guards 는 바깥 → 안쪽. 안쪽부터 감싸야 바깥 조건이 가장 먼저 평가된다.
    const tree = guards.reduceRight<SlotTree>(
        (inner, g) => ({
            kind: 'cond',
            test: () => guardTest(g, ctx.ms),
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
        ctx.pending.set(key, { openingEl, attribute, trees: [tree] });
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
 * pending 버킷을 MagicString 에 반영. opening element 당 한 번만 삽입/머지.
 */
export function flushInjects(ctx: InjectContext): void {
    for (const p of ctx.pending.values()) {
        const entries = renderEntries(p.trees);
        if (entries.length === 0) continue;
        const slotObj = `{ ${entries.join(', ')} }`;
        const attr = p.attribute;

        if (!attr) {
            const insertPos = findAttributeInsertPos(p.openingEl);
            ctx.ms.appendLeft(insertPos, ` style={${slotObj}}`);
            continue;
        }

        const attrValue = attr.value;
        if (!attrValue) {
            ctx.ms.overwrite(attr.start, attr.end, `style={${slotObj}}`);
            continue;
        }

        // JSXExpressionContainer 안 표현식 → spread 로 병합.
        // slot 을 먼저, 사용자 style 을 뒤로 둔다. React 는 spread object 를
        // 뒤에 오는 쪽이 이기는 순서로 머지하므로, 사용자가 명시적으로 style 로
        // 넘긴 값(slot CSS var 포함)은 항상 slot 기본값을 override 한다.
        // 리뷰 #6b 결함(주입 style 이 {...rest} 로 넘어온 style 을 덮음)을 해결.
        if (attrValue.type === 'JSXExpressionContainer' && attrValue.expression) {
            const inner = attrValue.expression;
            const existing = ctx.ms.original.slice(inner.start, inner.end);
            const merged = `{ ...${slotObj}, ...(${existing}) }`;
            ctx.ms.overwrite(inner.start, inner.end, merged);
        }
        // 다른 형태(StringLiteral 등) 는 injectJsxStyleForCall 가 미리 error 로 거른다.
    }
}

/**
 * call 을 감싼 조건 중 call 의 평가 여부를 결정하는 조건 하나.
 * - `truthy`: `test && call`, `test ? call : …`
 * - `falsy`: `test || call`, `test ? … : call`
 * - `nullish`: `test ?? call`
 */
interface Guard {
    test: AnyProp;
    when: 'truthy' | 'falsy' | 'nullish';
}

function guardTest({ test, when }: Guard, ms: MagicString): string {
    const t = `(${ms.slice(test.start, test.end)})`;
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

interface FoundJsx {
    openingEl: AnyProp;
    attribute: AnyProp | null;
    /** 바깥 → 안쪽. */
    guards: Guard[];
}

function findJsxAttribute(_call: AnyProp, parents: AnyProp[]): FoundJsx | { error: BuildError } {
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
            if (!attr || attr.type !== 'JSXAttribute') return { error: mkErr(_call, 'no-attr') };
            const nameNode = attr.name;
            if (!nameNode || nameNode.type !== 'JSXIdentifier' || nameNode.name !== 'className') {
                return { error: mkErr(_call, 'not-className') };
            }
            const openingEl = parents[i - 2];
            if (!openingEl || openingEl.type !== 'JSXOpeningElement') {
                return { error: mkErr(_call, 'no-opening') };
            }
            // 동일 opening element 안 다른 style attribute 검색.
            const styleAttr =
                (openingEl.attributes as AnyProp[]).find(
                    (a: AnyProp) =>
                        a?.type === 'JSXAttribute' &&
                        a.name?.type === 'JSXIdentifier' &&
                        a.name.name === 'style',
                ) ?? null;
            return { openingEl, attribute: styleAttr, guards: guards.reverse() };
        }
        if (!WRAPPER_TYPES.has(n.type)) {
            return { error: mkErr(_call, `unwrap:${n.type}`) };
        }
        const guard = guardOf(n, child);
        if (guard) guards.push(guard);
        child = n;
        i--;
    }
    return { error: mkErr(_call, 'no-jsx') };
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

function mkErr(call: AnyProp, tag: string): BuildError {
    return {
        code: 'dynamic-value',
        message: `Dynamic css() call must sit in a JSX className={...} position (detail: ${tag}).`,
        loc: {
            line: call.loc?.start.line ?? 1,
            column: call.loc?.start.column ?? 0,
        },
    };
}
