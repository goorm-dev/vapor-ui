import type MagicString from 'magic-string';

import { dynamicVarName } from '~/models/class-name';
import type { AnyProp, BuildError } from '~/models/types';

export interface DynamicCallSite {
    /** call node (CallExpression). */
    call: AnyProp;
    /** parent chain at walk time (자기 자신 제외, top-down). */
    parents: AnyProp[];
    /** call 이 CSS var 참조로 사용한 slot 들. */
    slots: Array<{ slotId: string; property: string; sourceExpr: string }>;
}

export interface InjectContext {
    ms: MagicString;
    mode: 'dev' | 'prod';
    /** JSX 컨테이너별 중복 삽입 방지 (동일 opening element 안에 여러 css() 있을 때). */
    injectedElements: Set<number>;
}

export interface InjectOutcome {
    success: boolean;
    error?: BuildError;
    usedMergeStyle?: boolean;
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
 * `style={{ '--slot': _resolveToken(prop, expr), ... }}` 를 삽입한다.
 * 이미 style prop 있으면 `_mergeStyle(existing, {...})` 로 감싼다.
 */
export function injectJsxStyleForCall(site: DynamicCallSite, ctx: InjectContext): InjectOutcome {
    const found = findJsxAttribute(site.call, site.parents);
    if ('error' in found) return { success: false, error: found.error };

    const { openingEl, attribute } = found;

    // slot object literal 생성. helpers 는 소비자 코드에 자동 import.
    const slotLits: string[] = [];
    for (const s of site.slots) {
        const varName = dynamicVarName(s.slotId, ctx.mode);
        // property 는 kebab-case. resolve-token 에서 camelCase 변환.
        slotLits.push(
            `'${varName}': _resolveToken(${JSON.stringify(s.property)}, ${s.sourceExpr})`,
        );
    }
    const slotObj = `{ ${slotLits.join(', ')} }`;

    // 동일 opening element 안 여러 css() 는 첫 site 만 style 주입,
    // 이후 site 는 이미 있는 style 확장. 지금은 단순히 첫 site 만 처리하고
    // 나머지는 skip (호출자가 rules 배열 보존).
    if (ctx.injectedElements.has(openingEl.start)) {
        return { success: true };
    }
    ctx.injectedElements.add(openingEl.start);

    if (!attribute) {
        // 새 style attribute. className attribute 뒤에 삽입.
        const insertPos = findAttributeInsertPos(openingEl);
        ctx.ms.appendLeft(insertPos, ` style={${slotObj}}`);
        return { success: true };
    }

    // 기존 style attribute — `_mergeStyle` 로 wrap.
    const attrValue = attribute.value;
    if (!attrValue) {
        // `style` 만 있고 value 없음 → 새로 대체.
        ctx.ms.overwrite(attribute.start, attribute.end, `style={${slotObj}}`);
        return { success: true };
    }
    // JSXExpressionContainer 안 표현식 감쌈.
    if (attrValue.type === 'JSXExpressionContainer') {
        const inner = attrValue.expression;
        if (inner) {
            const innerSrc = `_mergeStyle(${ctx.ms.original.slice(inner.start, inner.end)}, ${slotObj})`;
            ctx.ms.overwrite(inner.start, inner.end, innerSrc);
            return { success: true, usedMergeStyle: true };
        }
    }
    // string literal → 그대로 두고 {} 으로 감싸 병합.
    if (attrValue.type === 'Literal' && typeof attrValue.value === 'string') {
        const wrapped = `{_mergeStyle(${JSON.stringify(attrValue.value)}, ${slotObj})}`;
        ctx.ms.overwrite(attrValue.start, attrValue.end, wrapped);
        return { success: true, usedMergeStyle: true };
    }
    // 알 수 없는 shape → error.
    return {
        success: false,
        error: {
            code: 'dynamic-value',
            message: 'Failed to inject style prop next to className={css(...)}.',
            loc: { line: 0, column: 0 },
        },
    };
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
