// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyProp = any;
type PropSpec =
    | { kind: 'string'; name: string }
    | { kind: 'boolean'; name: string }
    | { kind: 'slot'; name: string }
    | { kind: 'enum'; name: string; options: Record<string, unknown> }
    | { kind: 'instance'; name: string };

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
): Partial<Record<K, AnyProp>> {
    const target = parent?.findInstance?.(instanceName);
    if (!target || target.type !== 'INSTANCE') return {};

    const result: Partial<Record<K, AnyProp>> = {};
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
                const nested = target.findInstance(spec.name);
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
