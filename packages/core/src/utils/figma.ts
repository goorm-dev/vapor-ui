import figma from 'figma';
import type { ErrorHandle, InstanceHandle, ResultSection, TemplateStringResult } from 'figma';

export type Snippet = string | ResultSection[] | TemplateStringResult;

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

export function swap(layer: InstanceHandle, name: string): Snippet {
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

export function example(handle: InstanceHandle | ErrorHandle | null | undefined): Snippet {
    return handle?.type === 'INSTANCE' ? handle.executeTemplate().example : '';
}

export function icon(layer: InstanceHandle, visible: string, swapName: string): Snippet {
    return toggle(layer, visible) ? swap(layer, swapName) : '';
}

export function placeholder(slot: InstanceHandle) {
    return bool(slot, 'value') ? '' : ` placeholder="${text(slot, 'Text')}"`;
}

export function lines(snippets: unknown[], indent = '    '): Snippet {
    return snippets.reduce<Snippet>((acc, snippet) => figma.code`${acc}\n${indent}${snippet}`, '');
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

export function body(snippets: unknown[], indent = ''): Snippet {
    if (snippets.length === 0) return '{/* contents */}';

    return figma.code`${lines(snippets, `${indent}    `)}\n${indent}`;
}

export function contents(layer: InstanceHandle, indent = ''): Snippet {
    return body(connectedChildren(layer).map(example), indent);
}
