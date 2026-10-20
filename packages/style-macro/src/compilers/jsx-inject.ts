import type MagicString from 'magic-string';

import { axisAliasName } from '~/models/axis-alias';
import { dynamicVarName } from '~/models/class-name';
import type { AnyProp, BuildError } from '~/models/types';

export interface DynamicCallSite {
    /** call node (CallExpression). */
    call: AnyProp;
    /** parent chain at walk time (자기 자신 제외, top-down). */
    parents: AnyProp[];
    /** call 이 CSS var 참조로 사용한 slot 들. */
    slots: Array<{
        slotId: string;
        /** 컴파일 타임에 결정된 토큰 axis 식별자. 없으면 `null` → emit 시 `{}` 리터럴 pass-through. */
        axis: string | null;
        sourceExpr: string;
    }>;
}

interface PendingInject {
    openingEl: AnyProp;
    attribute: AnyProp | null;
    slotLits: string[];
}

export interface InjectContext {
    ms: MagicString;
    mode: 'dev' | 'prod';
    /** openingEl.start → 해당 element 로 모인 slot 리터럴. flushInjects 가 소비. */
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
 * call 의 조상 체인을 훑어 `<Foo className={...}>` 위치를 찾고
 * 해당 opening element 의 slot 을 pending 버킷에 누적. 실제 삽입은
 * `flushInjects` 가 모든 call 수집 후 element 단위로 한 번에 처리.
 */
export function injectJsxStyleForCall(site: DynamicCallSite, ctx: InjectContext): InjectOutcome {
    const found = findJsxAttribute(site.call, site.parents);
    if ('error' in found) return { success: false, error: found.error };

    const { openingEl, attribute } = found;

    // 기존 style attribute 가 머지 가능한 형태인지 확인.
    if (attribute) {
        const v = attribute.value;
        if (v && !(v.type === 'JSXExpressionContainer' && v.expression)) {
            return { success: false, error: mkErr(site.call, 'style-unmergeable') };
        }
    }

    const slotLits: string[] = [];
    for (const s of site.slots) {
        const varName = dynamicVarName(s.slotId, ctx.mode);
        // axis 는 `@vapor-ui/style-macro/__runtime__` 에서 import 된 식별자 이름.
        // 사용자 스코프 충돌을 피하기 위해 `__vaporAxis_<name>` alias 로 참조한다.
        // null 이면 token lookup 자체가 의미 없으므로 빈 객체 리터럴로 pass-through.
        const axisRef = s.axis ? axisAliasName(s.axis) : '{}';
        slotLits.push(`'${varName}': _resolveToken(${axisRef}, ${s.sourceExpr})`);
    }

    const key = openingEl.start;
    const existing = ctx.pending.get(key);
    if (existing) {
        existing.slotLits.push(...slotLits);
    } else {
        ctx.pending.set(key, { openingEl, attribute, slotLits });
    }
    return { success: true };
}

/**
 * pending 버킷을 MagicString 에 반영. opening element 당 한 번만 삽입/머지.
 */
export function flushInjects(ctx: InjectContext): void {
    for (const p of ctx.pending.values()) {
        if (p.slotLits.length === 0) continue;
        const slotObj = `{ ${p.slotLits.join(', ')} }`;
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
        if (attrValue.type === 'JSXExpressionContainer' && attrValue.expression) {
            const inner = attrValue.expression;
            const existing = ctx.ms.original.slice(inner.start, inner.end);
            const merged = `{ ...(${existing}), ...${slotObj} }`;
            ctx.ms.overwrite(inner.start, inner.end, merged);
        }
        // 다른 형태(StringLiteral 등) 는 injectJsxStyleForCall 가 미리 error 로 거른다.
    }
}

interface FoundJsx {
    openingEl: AnyProp;
    attribute: AnyProp | null;
}

function findJsxAttribute(_call: AnyProp, parents: AnyProp[]): FoundJsx | { error: BuildError } {
    // parents 는 walker 가 자식→부모 순으로 push 하고 pop 하는 스택 뒤로 push된 상태.
    // parents[len-1] 이 call 의 직계 부모. 위로 올라가며 JSXExpressionContainer 를 찾음.
    let i = parents.length - 1;
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
            return { openingEl, attribute: styleAttr };
        }
        if (!WRAPPER_TYPES.has(n.type)) {
            return { error: mkErr(_call, `unwrap:${n.type}`) };
        }
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
