import figma from 'figma';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyProp = any;
type PropSpec =
    | { kind: 'string'; name: string }
    | { kind: 'boolean'; name: string }
    | { kind: 'slot'; name: string }
    | { kind: 'enum'; name: string; options: Record<string, unknown> }
    | { kind: 'instance'; name: string };

/**
 * Descend into a nested INSTANCE child of `parent` by name.
 * Returns the INSTANCE ref (chainable into `getProperties` / `findChild`),
 * or `undefined` when the child is missing or not an INSTANCE.
 *
 * Use when a component is wrapped in an anatomy layer (e.g. `(Popup)` around
 * `(Header)` / `(Body)` / `(Footer)`) and you need to read properties from
 * the inner instances.
 *
 * @param parent        Parent instance/component to search inside.
 * @param instanceName  Direct-child instance name (e.g. '(Popup)').
 * @returns             Child INSTANCE ref, or `undefined`.
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
 * Each key in `specs` is the code prop name. Every non-`slot` value is rendered
 * with `figma.helpers.react.renderProp(key, value)`:
 *
 * - `undefined` / `''`      → `''` (attribute omitted — safe for optional props)
 * - `string`                → ` key="value"`
 * - `boolean`               → ` key` or `''`
 * - `ResultSection[]`       → ` key={<pill>}` (or fragment-wrapped when > 1)
 *
 * `slot` values are passed through `renderChildren` and stay raw so they can be
 * interpolated as element children.
 *
 * All keys are always present, so a missing target instance yields `''` for
 * every attribute instead of the literal string `undefined`.
 *
 * @example
 * const footer = getProperties(instance, '(Footer)', {
 *     assistive: { kind: 'instance', name: 'Assistive' },
 *     action: { kind: 'instance', name: 'Action' },
 * });
 * figma.code`<Dialog.Root${footer.assistive}${footer.action}>${body.children}</Dialog.Root>`;
 *
 * @param parent        Parent instance/component to search inside.
 * @param instanceName  Direct-child instance name (e.g. '(Header)').
 * @param specs         Map of code prop name → figma property descriptor.
 * @returns             Map of code prop name → rendered attribute (or raw slot).
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
