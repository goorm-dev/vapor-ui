import figma from 'figma';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyProp = any;

type PropSpec =
    | { kind: 'string'; name: string; visibleWhen?: string }
    | { kind: 'boolean'; name: string; visibleWhen?: string }
    | { kind: 'slot'; name: string; visibleWhen?: string }
    | { kind: 'enum'; name: string; options: Record<string, unknown>; visibleWhen?: string }
    | { kind: 'instance'; name: string; visibleWhen?: string };

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
            return target.getSlot(spec.name);
        case 'enum':
            return target.getEnum(spec.name, spec.options);
        case 'instance': {
            const nested = target.findInstance(spec.name, { traverseInstances: true });
            return nested && nested.type === 'INSTANCE'
                ? nested.executeTemplate().example
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
    instanceName: string,
    specs: Record<K, PropSpec>,
    options?: { path?: string[]; traverseInstances?: boolean },
): Record<K, AnyProp> {
    const target = findChild(parent, instanceName, options);
    const result = {} as Record<K, AnyProp>;

    for (const key in specs) {
        const spec = specs[key];
        const value = target ? readRawValue(target, spec) : undefined;

        result[key] =
            spec.kind === 'slot'
                ? figma.helpers.react.renderChildren(value)
                : figma.helpers.react.renderProp(key, value);
    }
    return result;
}
