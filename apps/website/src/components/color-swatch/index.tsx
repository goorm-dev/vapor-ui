'use client';

import { useEffect, useState } from 'react';

import { Text, VStack, useTheme } from '@vapor-ui/core';
import { CheckCircleOutlineIcon, CopyOutlineIcon } from '@vapor-ui/icons';
import clsx from 'clsx';
import type { LAB } from 'color-convert';
import colorConvert from 'color-convert';
import { useCopyButton } from 'fumadocs-ui/utils/use-copy-button';

type OKLAB = [l: number, a: number, b: number];
type OKLCH = [l: number, c: number, h: number];

interface ColorConvertExtended {
    rgb: {
        oklab: (rgb: [number, number, number]) => OKLAB;
    };
    oklab: {
        oklch: (oklab: OKLAB) => OKLCH;
    };
}

interface ColorSwatchProps {
    name: string;
    variable: string;
    value?: string;
    className?: string;
    foreground?: string;
}

const getLabValue = (value: string): LAB | null => {
    const match = value.match(/\d+/g);

    if (match && match.length >= 3) {
        return [Number(match[0]), Number(match[1]), Number(match[2])];
    }

    return null;
};

export function ColorSwatch({ className, foreground, name, value, variable }: ColorSwatchProps) {
    const { theme } = useTheme();

    const [hexValue, setHexValue] = useState<string>('');
    const [textColorClass, setTextColorClass] = useState<string>('text-v-black');
    const [checked, onClick] = useCopyButton(async () => {
        if (!hexValue) return;

        await navigator.clipboard.writeText(`var(${prefixedVariable}, ${hexValue})`);
    });

    const prefixedVariable = variable.startsWith('--') ? variable : `--vapor-color-${variable}`;
    const prefixedForeground = foreground?.startsWith('--')
        ? foreground
        : `--vapor-color-${foreground}`;

    useEffect(() => {
        const resolveVariable = (varName: string, depth = 0): string => {
            if (depth > 5) return '';

            const value = getComputedStyle(document.documentElement)
                .getPropertyValue(varName)
                .trim();

            if (!value) return '';

            if (value.startsWith('var(')) {
                const match = value.match(/var\((--[^)]+)\)/);

                if (match && match[1]) {
                    return resolveVariable(match[1], depth + 1);
                }
            }

            return value;
        };

        const rafId = requestAnimationFrame(() => {
            const computedValue = resolveVariable(prefixedVariable);

            if (computedValue) {
                try {
                    let hexColor: string;
                    let oklch: OKLCH;

                    if (computedValue.startsWith('lab')) {
                        const labValue = getLabValue(computedValue);

                        if (labValue) {
                            hexColor = `#${colorConvert.lab.hex(labValue)}`;
                            const rgb = colorConvert.lab.rgb(labValue);
                            const convertExt = colorConvert as unknown as ColorConvertExtended;
                            const oklab = convertExt.rgb.oklab(rgb as [number, number, number]);
                            oklch = convertExt.oklab.oklch(oklab);
                        } else {
                            throw new Error('Invalid lab value');
                        }
                    } else {
                        hexColor = computedValue;
                        const rgb = colorConvert.hex.rgb(computedValue);
                        const convertExt = colorConvert as unknown as ColorConvertExtended;
                        const oklab = convertExt.rgb.oklab(rgb);
                        oklch = convertExt.oklab.oklch(oklab);
                    }

                    setHexValue(hexColor);

                    const lightnessThreshold = 65;
                    const textColorValue =
                        oklch[0] >= lightnessThreshold ? 'text-v-black' : 'text-v-white';
                    setTextColorClass(textColorValue);
                } catch (e) {
                    console.warn(`Failed to convert color for ${variable}:`, e);
                    setTextColorClass('text-v-black');
                }
            }
        });

        return () => cancelAnimationFrame(rafId);
    }, [prefixedVariable, value, variable, theme]);

    const IconElement = checked ? CheckCircleOutlineIcon : CopyOutlineIcon;

    const [prefix, ...varName] = name.split(' ');
    const displayName = varName.join(' ');

    return (
        <VStack alignItems="center" gap="$100" className={className}>
            <button
                className="border-border focus:ring-accent group relative size-20 ring-offset-[var(--vapor-color-gray-000)] rounded-lg border shadow-sm transition-[transform,outline,scale] hover:scale-105 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2"
                type="button"
                style={{ backgroundColor: `var(${prefixedVariable})` }}
                onClick={onClick}
            >
                <span className="sr-only">Copy {name} color</span>
                <div className="absolute inset-0 flex items-center justify-center rounded-lg">
                    <Text
                        typography="code2"
                        className={clsx(
                            'opacity-100 transition-opacity group-hover:opacity-0 data-[checked=true]:opacity-0',
                            !foreground && textColorClass,
                        )}
                        data-checked={checked}
                        style={foreground ? { color: `var(${prefixedForeground})` } : undefined}
                    >
                        {hexValue}
                    </Text>
                    <IconElement
                        className={clsx(
                            'absolute size-5 opacity-0 transition-all group-hover:opacity-100 data-[checked=true]:opacity-100',
                            !foreground && textColorClass,
                        )}
                        data-checked={checked}
                        style={foreground ? { color: `var(${prefixedForeground})` } : undefined}
                    />
                </div>
            </button>

            <VStack textAlign="center" maxWidth="max-content">
                <Text typography="subtitle2">{prefix}</Text>
                {displayName && <Text typography="subtitle2">{displayName}</Text>}
            </VStack>
        </VStack>
    );
}

interface ColorPaletteProps {
    colors: Array<{
        name: string;
        variable: string;
        value?: string;
        foreground?: string;
    }>;
    className?: string;
}

export function ColorPalette({ className, colors }: ColorPaletteProps) {
    return (
        <div className={clsx('mb-6', className)}>
            <div className="my-5 flex flex-wrap gap-4 sm:gap-6">
                {colors.map((color) => (
                    <ColorSwatch
                        key={color.variable}
                        foreground={color.foreground}
                        name={color.name}
                        value={color.value}
                        variable={color.variable}
                    />
                ))}
            </div>
        </div>
    );
}
