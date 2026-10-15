// Helpers for Code Connect templates (`*.figma.ts`). Templates bundle relative imports only,
// so import this file with a relative path, not the `~/` alias.
import figma from 'figma';
import type { ErrorHandle, InstanceHandle, TemplateStringResult } from 'figma';

/** Reads a `true`/`false` VARIANT property. */
export function bool(layer: InstanceHandle, name: string) {
    return layer.getEnum(name, { true: true, false: false }) ?? false;
}

/** Renders boolean props as JSX attributes: `{ disabled: true, invalid: false }` → ` disabled`. */
export function flags(props: Record<string, boolean>) {
    return Object.keys(props)
        .filter((key) => props[key])
        .map((key) => ` ${key}`)
        .join('');
}

/** Renders a connected instance's snippet, or nothing when the layer is missing. */
export function example(handle: InstanceHandle | ErrorHandle | null | undefined) {
    return handle?.type === 'INSTANCE' ? handle.executeTemplate().example : '';
}

/** Renders a swapped icon when its visibility toggle is on. */
export function icon(layer: InstanceHandle, visible: string, swap: string) {
    return layer.getBoolean(visible) ? example(layer.getInstanceSwap(swap)) : '';
}

/** Puts each snippet on its own line at `indent`, without joining snippets as strings. */
export function lines(snippets: unknown[], indent = '    ') {
    return snippets.reduce<TemplateStringResult | string>(
        (acc, snippet) => figma.code`${acc}\n${indent}${snippet}`,
        '',
    );
}

/** Connected instances directly inside `layer`, looking one level into unconnected wrappers. */
export function connectedChildren(layer: InstanceHandle) {
    return layer.children.flatMap((node) => {
        if (node.type !== 'INSTANCE') return [];
        if (node.hasCodeConnect()) return [node];

        return node.children.filter(
            (inner): inner is InstanceHandle => inner.type === 'INSTANCE' && inner.hasCodeConnect(),
        );
    });
}
