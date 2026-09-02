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
 * Read multiple property values from a nested INSTANCE inside `parent`.
 * Returns `{}` (all values undefined) when the target instance is missing.
 *
 * @param parent        Parent instance/component to search inside.
 * @param instanceName  Direct-child instance name (e.g. '(Header)').
 * @param specs         Map of local key → figma property descriptor.
 * @returns             Map of local key → resolved value.
 */
export function getProperties<K extends string>(
    parent: AnyProp,
    instanceName: string,
    specs: Record<K, PropSpec>,
    options?: { path?: string[]; traverseInstances?: boolean },
): Partial<Record<K, AnyProp>> {
    const target = findChild(parent, instanceName, options);

    const result: Partial<Record<K, AnyProp>> = {};
    if (!target) return result;

    for (const key in specs) {
        const spec = specs[key];
        switch (spec.kind) {
            case 'string':
                result[key] = target.getString(spec.name);
                break;
            case 'boolean':
                result[key] = target.getBoolean(spec.name);
                break;
            case 'slot':
                result[key] = target.getSlot(spec.name);
                break;
            case 'enum':
                result[key] = target.getEnum(spec.name, spec.options);
                break;
            case 'instance': {
                const nested = target.findInstance(spec.name, { traverseInstances: true });
                result[key] =
                    nested && nested.type === 'INSTANCE'
                        ? nested.executeTemplate().example
                        : undefined;
                break;
            }
        }
    }
    return result;
}
