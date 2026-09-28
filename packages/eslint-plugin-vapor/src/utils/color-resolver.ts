import { formatHex, formatHex8, modeOklch, useMode } from 'culori/fn';

// Register oklch mode so formatHex / formatHex8 can convert oklch → rgb
useMode(modeOklch);

type OklchColor = { mode: 'oklch'; l: number; c: number; h: number; alpha?: number };

export function oklchToHex(components: readonly [number, number, number], alpha?: number): string {
    const color: OklchColor = {
        mode: 'oklch',
        l: components[0],
        c: components[1],
        h: components[2],
        alpha: alpha,
    };
    const result = alpha != null && alpha < 1 ? formatHex8(color) : formatHex(color);

    return result.toLowerCase();
}
