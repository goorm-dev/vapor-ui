import figma from 'figma';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyProp = any;

type PropSpec =
    | { kind: 'string'; name: string; visibleWhen?: string }
    | { kind: 'boolean'; name: string; visibleWhen?: string }
    | { kind: 'slot'; name: string; visibleWhen?: string }
    | { kind: 'prop-slot'; name: string; visibleWhen?: string }
    | { kind: 'enum'; name: string; options: Record<string, unknown>; visibleWhen?: string }
    | { kind: 'instance'; name: string; visibleWhen?: string }
    | { kind: 'instance-swap'; name: string; visibleWhen?: string };

/**
 * Descend into a nested INSTANCE child of `parent` by name.
 * Returns the INSTANCE ref (chainable into `getProperties` / `findChild`),
 * or `undefined` when the child is missing or not an INSTANCE.
 */
export function findChild(
    parent: AnyProp,
    instanceName: string,
    options?: { path?: string[]; traverseInstances?: boolean },
): AnyProp | undefined {
    const target = options
        ? parent?.findInstance?.(instanceName, options)
        : parent?.findInstance?.(instanceName, { traverseInstances: true });

    if (!target || target.type !== 'INSTANCE') return undefined;

    return target;
}

/**
 * Resolve a single raw property value from `target` according to `spec`.
 * Returns `undefined` when the value is missing (e.g. instance not found).
 */
function readRawValue(target: AnyProp, spec: PropSpec): AnyProp {
    if (spec.visibleWhen && target.getBoolean(spec.visibleWhen) === false) return;

    switch (spec.kind) {
        case 'string':
            return target.getString(spec.name);
        case 'boolean':
            return target.getBoolean(spec.name);
        case 'slot':
        case 'prop-slot':
            return target.getSlot(spec.name);
        case 'enum':
            return target.getEnum(spec.name, spec.options);
        case 'instance': {
            // Figma layer 이름으로 중첩 instance 를 찾는다 (property 이름 아님).
            const nested = target.findInstance(spec.name, { traverseInstances: true });
            return nested && nested.type === 'INSTANCE'
                ? nested.executeTemplate().example
                : undefined;
        }
        case 'instance-swap': {
            // Figma INSTANCE_SWAP property 를 propName 으로 꺼낸다.
            const swapped = target.getInstanceSwap(spec.name);
            return swapped && swapped.type === 'INSTANCE'
                ? swapped.executeTemplate().example
                : undefined;
        }
    }
}

/**
 * Read multiple properties from a nested INSTANCE inside `parent` and return
 * them **pre-rendered as JSX attribute fragments**, keyed by the code prop name.
 *
 * @example
 * const footer = getProperties(instance, '(Footer)', {
 *     assistive: { kind: 'instance', name: 'Assistive' },
 *     action: { kind: 'instance', name: 'Action' },
 * });
 * figma.code`<Dialog.Root${footer.assistive}${footer.action}>${body.children}</Dialog.Root>`;
 *
 */
export function getProperties<K extends string>(
    parent: AnyProp,
    instanceName: string | null,
    specs: Record<K, PropSpec>,
    options?: { path?: string[]; traverseInstances?: boolean },
): Record<K, AnyProp> {
    const target = instanceName === null ? parent : findChild(parent, instanceName, options);
    const result = {} as Record<K, AnyProp>;

    for (const key in specs) {
        const spec = specs[key];
        const value = target ? readRawValue(target, spec) : undefined;

        // `slot` 은 children 자리 (renderChildren),
        // 그 외 (`prop-slot` 포함) 는 JSX attribute 자리 (renderProp).
        result[key] =
            spec.kind === 'slot'
                ? figma.helpers.react.renderChildren(value)
                : figma.helpers.react.renderProp(key, value);
    }
    return result;
}

/**
 * `parent` 트리를 레이어 패널 순서로 내려가며 이름이 `innerInstanceNames` 에 들어있는
 * INSTANCE 를 수집해 children JSX 로 렌더한다. 매칭된 노드는 더 descend 하지 않는다.
 *
 * - 중간에 `(Menu element)` 같은 wrapper 가 있어도 descend 하므로 벗겨내는 효과가 난다.
 * - wrapper 가 없는 구조(예: Menu.Group `(add item)` 슬롯이 바로 Item 을 담는 경우) 에서도 작동한다.
 * - `Item group` / `Check group` 매칭 시 멈추므로 그 안쪽 중첩 `Item` 은 집어가지 않는다.
 * - `instance.children` 를 쓰므로 레이어 패널 순서가 보존된다
 *   (findLayers 는 반환 순서 명세가 없어 캔버스 Z-order 로 뒤집히는 경우가 있다).
 *
 * @param parent  탐색을 시작할 상위 instance (예: Menu, Item group, Check group)
 * @param innerInstanceNames  children 으로 노출할 INSTANCE 이름 집합
 * @returns renderChildren 결과 — 템플릿의 children 자리에 그대로 interpolate
 */
export function renderInnerInstances(parent: AnyProp, innerInstanceNames: Set<string>): AnyProp {
    const collect = (node: AnyProp): AnyProp[] => {
        if (!node) return [];
        if (node.type === 'INSTANCE' && innerInstanceNames.has(node.name)) {
            return [node.executeTemplate().example];
        }
        return node.children ? node.children.flatMap(collect) : [];
    };

    const children = parent.children.flatMap(collect);
    return figma.helpers.react.renderChildren(children);
}
