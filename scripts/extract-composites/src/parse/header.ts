import {
    HEADER_INSTANCE_NAME,
    HEADER_TYPE_COMPONENT_VALUE,
    HEADER_TYPE_PROP,
    TEXT_NAMES,
} from '../constants.ts';
import type { FigmaNode } from '../model.ts';
import { findTextByName } from '../traverse.ts';

/** Figma는 variant prop key에 `#<schemaId>`를 붙이므로 `#` 앞 segment로 비교한다. */
export function findComponentHeader(canvas: FigmaNode): FigmaNode | undefined {
    const walk = (n: FigmaNode): FigmaNode | undefined => {
        for (const child of n.children ?? []) {
            if (
                child.type === 'INSTANCE' &&
                child.name === HEADER_INSTANCE_NAME &&
                hasTypeComponent(child)
            ) {
                return child;
            }
            const nested = walk(child);
            if (nested) return nested;
        }
        return undefined;
    };
    return walk(canvas);
}

function hasTypeComponent(node: FigmaNode): boolean {
    const props = node.componentProperties;
    if (!props) return false;
    for (const [key, prop] of Object.entries(props)) {
        if (key.split('#')[0] !== HEADER_TYPE_PROP) continue;
        if (prop.value === HEADER_TYPE_COMPONENT_VALUE) return true;
    }
    return false;
}

export function resolveComponentMeta(
    canvas: FigmaNode,
    canvasName: string,
    warnings: string[],
): { title: string; description: string } {
    const header = findComponentHeader(canvas);
    if (!header) {
        warnings.push(
            `${HEADER_INSTANCE_NAME} INSTANCE (type=component) missing — frontmatter falls back to canvas name`,
        );
        return { title: canvasName, description: '' };
    }
    const title = findTextByName(header, TEXT_NAMES.componentName) ?? canvasName;
    const description = findTextByName(header, TEXT_NAMES.componentDescription) ?? '';
    if (!description) {
        warnings.push(`${HEADER_INSTANCE_NAME}: "${TEXT_NAMES.componentDescription}" TEXT missing`);
    }
    return { title, description };
}
