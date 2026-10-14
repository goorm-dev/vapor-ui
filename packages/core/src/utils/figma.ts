// Helpers for Code Connect templates (`*.figma.ts`). Templates bundle relative imports only,
// so import this file with a relative path, not the `~/` alias.
import type { ErrorHandle, InstanceHandle } from 'figma';

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
