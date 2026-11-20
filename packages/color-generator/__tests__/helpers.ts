import type { ThemeResult } from '../src';

type Mode = 'light' | 'dark';

const tokens = (result: ThemeResult, mode: Mode) =>
    mode === 'light' ? result.lightModeTokens : result.darkModeTokens;

/** `{ color: { scale: 'RRGGBB' } }`, the reference fixture shape. */
export const table = (result: ThemeResult, mode: Mode) =>
    Object.fromEntries(
        tokens(result, mode).palettes.map((p) => [
            p.name,
            Object.fromEntries(
                Object.entries(p.chips).map(([s, chip]) => [s, chip.hex.slice(1).toUpperCase()]),
            ),
        ]),
    );

/** Copy of `result` with one cell's HEX replaced. */
export const withHex = (
    result: ThemeResult,
    mode: Mode,
    color: string,
    scale: string,
    hex: string,
) => {
    const copy = structuredClone(result);
    tokens(copy, mode).palettes.find((p) => p.name === color)!.chips[scale].hex = `#${hex}`;
    return copy;
};
