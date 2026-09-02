/**
 * Figma MCP `get_context_for_code_connect` 결과 → ComponentTree.
 * 배열이면 첫 항목을 쓴다.
 *
 * @param {object | object[]} json
 * @returns {{ name: string, tree: import('../model.mjs').Node }}
 */
export function fromMcp(json) {
    const root = Array.isArray(json) ? json[0] : json;
    if (!root || typeof root.name !== 'string') {
        throw new Error('Invalid MCP JSON: expected object with `name` and `descendants`');
    }
    return {
        name: root.name,
        tree: {
            kind: 'ROOT',
            name: root.name,
            props: toProps(root.properties),
            children: toChildren(root.descendants),
        },
    };
}

function toProps(properties = {}) {
    return Object.values(properties).map((p) => {
        /** @type {import('../model.mjs').Prop} */
        const prop = { name: p.name, type: p.type };
        if (p.type === 'VARIANT') prop.variantOptions = p.variantOptions ?? [];
        return prop;
    });
}

function toChildren(descendants = {}) {
    return Object.values(descendants)
        .filter((d) => d.type === 'INSTANCE')
        .map((d) => ({
            kind: 'INSTANCE',
            name: d.name,
            props: toProps(d.properties),
            children: toChildren(d.descendants),
        }));
}
