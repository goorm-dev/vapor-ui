import { stripPropId } from '../naming.mjs';

/**
 * `/v1/files/:key/nodes?ids=<nodeId>` 응답에서 INSTANCE 가 참조하는 component set id 를 모은다.
 *
 * @param {object} nodesJson
 * @param {string} nodeId
 * @returns {string[]}
 */
export function collectComponentSetIds(nodesJson, nodeId) {
    const entry = getEntry(nodesJson, nodeId);
    const ids = new Set();
    walk(entry.document, (n) => {
        const setId = entry.components?.[n.componentId]?.componentSetId;
        if (setId) ids.add(setId);
    });
    return [...ids];
}

/**
 * Figma REST nodes 응답 → ComponentTree.
 *
 * @param {object} nodesJson   `/v1/files/:key/nodes?ids=<nodeId>` 응답
 * @param {string} nodeId
 * @param {Record<string, object>} setDocs  componentSetId → COMPONENT_SET document (componentPropertyDefinitions 포함)
 * @returns {{ name: string, tree: import('../model.mjs').Node }}
 */
export function fromRest(nodesJson, nodeId, setDocs) {
    const entry = getEntry(nodesJson, nodeId);
    const doc = entry.document;

    const toNode = (n) => ({
        kind: 'INSTANCE',
        name: n.name,
        props: toProps(n, entry.components, setDocs),
        children: (n.children ?? []).filter((c) => c.type === 'INSTANCE').map(toNode),
    });

    return {
        name: doc.name,
        tree: {
            kind: 'ROOT',
            name: doc.name,
            props: [],
            children: (doc.children ?? []).filter((c) => c.type === 'INSTANCE').map(toNode),
        },
    };
}

function getEntry(nodesJson, nodeId) {
    const entry = nodesJson?.nodes?.[nodeId];
    if (!entry?.document) throw new Error(`Node '${nodeId}' not found in REST response`);
    return entry;
}

function walk(node, visit) {
    if (node.type === 'INSTANCE') visit(node);
    for (const c of node.children ?? []) walk(c, visit);
}

function toProps(instance, components, setDocs) {
    const setId = components?.[instance.componentId]?.componentSetId;
    const defs = setDocs?.[setId]?.componentPropertyDefinitions ?? {};

    return Object.entries(instance.componentProperties ?? {}).map(([rawName, p]) => {
        const name = stripPropId(rawName);
        /** @type {import('../model.mjs').Prop} */
        const prop = { name, type: p.type };
        if (p.type === 'VARIANT') {
            prop.variantOptions = defs[rawName]?.variantOptions ??
                defs[name]?.variantOptions ?? [String(p.value)];
        }
        return prop;
    });
}
