import { useState } from 'react';

import type { Scale, ThemeResult } from '@vapor-ui/color-generator';
import { Button, HStack, Text, VStack } from '@vapor-ui/core';

import type { Hues } from '~/ui/features/theme-draft';
import { COLOR_SCALES, HUE_RANGE, hueDelta, hueOf } from '~/ui/features/theme-draft';

const GRAY_SCALES: readonly Scale[] = ['000', '025', ...COLOR_SCALES];
const MODES = ['light', 'dark'] as const;

const FLAG_RING = { warn: 'ring-2 ring-v-orange-500', fail: 'ring-2 ring-v-red-600' } as const;

const chipsOf = (theme: ThemeResult, mode: (typeof MODES)[number], name: string) =>
    (mode === 'light' ? theme.lightModeTokens : theme.darkModeTokens).palettes.find(
        (p) => p.name === name,
    )?.chips ?? {};

interface HueSliderProps {
    label: string;
    baseHue: number;
    /** The edited hue, or `undefined` for the generated one. */
    hue: number | undefined;
    onChange: (hue: number | null) => void;
}

const HueSlider = ({ label, baseHue, hue, onChange }: HueSliderProps) => {
    // Unwrapped around the baseline so a slider near 0°/360° stays continuous.
    const value = baseHue + hueDelta(baseHue, hue ?? baseHue);
    return (
        <HStack $css={{ gap: '$100', alignItems: 'center' }}>
            <Text typography="body3" className="w-36 shrink-0">
                {label} 색조 {(hue ?? baseHue).toFixed(1)}°
            </Text>
            <input
                type="range"
                aria-label={`${label} 색조`}
                min={baseHue - HUE_RANGE}
                max={baseHue + HUE_RANGE}
                step={0.5}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="flex-1 min-w-0"
            />
            <Button
                size="sm"
                variant="ghost"
                colorPalette="secondary"
                disabled={hue === undefined}
                onClick={() => onChange(null)}
            >
                초기화
            </Button>
        </HStack>
    );
};

interface PaletteEditorProps {
    name: string;
    theme: ThemeResult;
    /** The same theme without hue edits; each slider is centered on its hue. */
    baseline: ThemeResult;
    hues: Hues;
    /** Cells a check names, keyed `light blue-500`. */
    flags: Map<string, 'warn' | 'fail'>;
    /** Omit for a read-only palette. */
    onHue?: (scale: Scale, hue: number | null) => void;
    /** The pinned brand cell, which ignores hue edits. */
    lockedScale?: Scale;
}

/**
 * Light and dark rows of one palette. Picking a light cell opens its hue slider; dark follows
 * the light curve, so it is read-only.
 */
export const PaletteEditor = ({
    name,
    theme,
    baseline,
    hues,
    flags,
    onHue,
    lockedScale,
}: PaletteEditorProps) => {
    const [selected, setSelected] = useState<Scale | null>(null);
    const scales = name === 'gray' ? GRAY_SCALES : COLOR_SCALES;
    const editable = (scale: Scale) => onHue !== undefined && scale !== lockedScale;

    // The brand cell can move onto the selected scale when the brand HEX changes.
    const active = selected && editable(selected) ? selected : null;
    const baseChip = active && chipsOf(baseline, 'light', name)[active];
    const baseHue = baseChip ? hueOf(baseChip.oklch) : null;
    const edited = active ? hues[active] : undefined;

    return (
        <VStack $css={{ gap: '$100' }}>
            {MODES.map((mode) => {
                const chips = chipsOf(theme, mode, name);
                return (
                    <HStack key={mode} $css={{ gap: '$050', alignItems: 'center' }}>
                        <Text typography="body4" foreground="hint-200" className="w-8 shrink-0">
                            {mode}
                        </Text>
                        {scales.map((scale) => {
                            const chip = chips[scale];
                            if (!chip) return null;
                            const flag = flags.get(`${mode} ${name}-${scale}`);
                            const canEdit = mode === 'light' && editable(scale);
                            return (
                                <button
                                    key={scale}
                                    type="button"
                                    disabled={!canEdit}
                                    onClick={() => setSelected(selected === scale ? null : scale)}
                                    title={`${chip.name} ${chip.hex} ${chip.oklch}${scale === lockedScale && mode === 'light' ? ' (브랜드 고정)' : ''}`}
                                    aria-pressed={canEdit ? selected === scale : undefined}
                                    className={[
                                        'relative h-8 flex-1 min-w-0 rounded border border-black/10',
                                        canEdit ? 'cursor-pointer' : 'cursor-default',
                                        flag ? FLAG_RING[flag] : '',
                                        canEdit && selected === scale
                                            ? 'outline-2 outline-offset-1 outline-black'
                                            : '',
                                    ].join(' ')}
                                    style={{ background: chip.hex }}
                                >
                                    {mode === 'light' && scale in hues && (
                                        <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-white ring-1 ring-black" />
                                    )}
                                    {mode === 'light' && scale === lockedScale && (
                                        <span className="absolute inset-0 grid place-items-center text-[10px] text-white mix-blend-difference">
                                            ●
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </HStack>
                );
            })}
            <HStack $css={{ gap: '$050' }}>
                <span className="w-8 shrink-0" />
                {scales.map((scale) => (
                    <Text
                        key={scale}
                        typography="body4"
                        foreground="hint-200"
                        className="flex-1 min-w-0 text-center"
                    >
                        {scale}
                    </Text>
                ))}
            </HStack>

            {active && baseHue !== null && onHue && (
                <HueSlider
                    label={`${name}-${active}`}
                    baseHue={baseHue}
                    hue={edited}
                    onChange={(hue) => onHue(active, hue)}
                />
            )}
        </VStack>
    );
};
