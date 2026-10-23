// Helpers for Code Connect templates (`*.figma.ts`). Templates bundle relative imports only,
// so import this file with a relative path, not the `~/` alias.
import figma from 'figma';
import type { ErrorHandle, InstanceHandle, TemplateStringResult } from 'figma';

function drift(name: string): never {
    throw new Error(`Figma property "${name}" is missing or has an unmapped option (Drift).`);
}

export function pick<O extends Record<string, unknown>>(
    layer: InstanceHandle,
    name: string,
    options: O,
) {
    const value = layer.getEnum(name, options);
    if (!Object.values(options).includes(value)) drift(name);

    return value as O[keyof O];
}

export function bool(layer: InstanceHandle, name: string) {
    return pick(layer, name, { true: true, false: false });
}

export function toggle(layer: InstanceHandle, name: string) {
    const value = layer.getBoolean(name);
    if (typeof value !== 'boolean') drift(name);

    return value;
}

export function text(layer: InstanceHandle, name: string) {
    const value = layer.getString(name);
    if (typeof value !== 'string') drift(name);

    return value;
}

export function swap(layer: InstanceHandle, name: string) {
    const handle = layer.getInstanceSwap(name);
    if (handle?.type !== 'INSTANCE') drift(name);

    return handle.executeTemplate().example;
}

export function flags(props: Record<string, boolean>) {
    return Object.keys(props)
        .filter((key) => props[key])
        .map((key) => ` ${key}`)
        .join('');
}

export function example(handle: InstanceHandle | ErrorHandle | null | undefined) {
    return handle?.type === 'INSTANCE' ? handle.executeTemplate().example : '';
}

export function icon(layer: InstanceHandle, visible: string, swapName: string) {
    return toggle(layer, visible) ? swap(layer, swapName) : '';
}

export function placeholder(slot: InstanceHandle) {
    return bool(slot, 'value') ? '' : ` placeholder="${text(slot, 'Text')}"`;
}

export function lines(snippets: unknown[], indent = '    ') {
    return snippets.reduce<TemplateStringResult | string>(
        (acc, snippet) => figma.code`${acc}\n${indent}${snippet}`,
        '',
    );
}

export function connectedChildren(layer: InstanceHandle) {
    return layer.children.flatMap((node) => {
        if (node.type !== 'INSTANCE') return [];
        if (node.hasCodeConnect()) return [node];

        return node.children.filter(
            (inner): inner is InstanceHandle => inner.type === 'INSTANCE' && inner.hasCodeConnect(),
        );
    });
}
