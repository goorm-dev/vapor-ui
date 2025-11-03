'use client';

import * as React from 'react';

import { Text, VStack, useTheme } from '@vapor-ui/core';
import { CopyOutlineIcon } from '@vapor-ui/icons';
import clsx from 'clsx';
import type { LAB } from 'color-convert';
import colorConvert from 'color-convert';
import { useCopyButton } from 'fumadocs-ui/utils/use-copy-button';

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

    const [hexValue, setHexValue] = React.useState<string>('');
    const [checked, onClick] = useCopyButton(async () => {
        if (!hexValue) return;

        // Copy the hex value to clipboard
        await navigator.clipboard.writeText(hexValue);
    });

    const prefixedVariable = variable.startsWith('--') ? variable : `--vapor-color-${variable}`;
    const prefixedForeground = foreground?.startsWith('--')
        ? foreground
        : `--vapor-color-${foreground}`;

    React.useEffect(() => {
        // Recursively resolve CSS variable references
        const resolveVariable = (varName: string, depth = 0): string => {
            if (depth > 5) return ''; // Max recursion depth

            const value = getComputedStyle(document.documentElement)
                .getPropertyValue(varName)
                .trim();

            if (!value) return '';

            // Check if the value is another CSS variable reference
            if (value.startsWith('var(')) {
                // Extract the variable name from var(--variable-name)
                const match = value.match(/var\((--[^)]+)\)/);

                if (match && match[1]) {
                    return resolveVariable(match[1], depth + 1);
                }
            }

            return value;
        };

        const computedValue = resolveVariable(prefixedVariable);

        // Convert to hex using the browser's native color conversion
        if (computedValue) {
            try {
                if (computedValue.startsWith('lab')) {
                    const labValue = getLabValue(computedValue);

                    if (labValue) {
                        setHexValue(`#${colorConvert.lab.hex(labValue)}`);
                    } else {
                        throw new Error('Invalid lab value');
                    }
                } else {
                    setHexValue(computedValue);
                }
            } catch (e) {
                console.warn(`Failed to convert color for ${variable}:`, e);
            }
        }
    }, [prefixedVariable, value, variable, theme]);

    const IconElement = checked ? CheckIcon : CopyOutlineIcon;

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
                    <IconElement
                        className="size-5 opacity-0 transition-all group-hover:opacity-100 data-[checked=true]:opacity-100"
                        data-checked={checked}
                        style={
                            foreground
                                ? { color: `var(${prefixedForeground})` }
                                : {
                                      filter: 'contrast(200%) brightness(0) invert(1) drop-shadow(0 1px 1px rgba(0,0,0,0.5))',
                                      mixBlendMode: 'difference',
                                  }
                        }
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

const CheckIcon = (props: React.ComponentProps<'svg'>) => {
    return (
        <svg
            width="15"
            height="15"
            viewBox="0 0 15 15"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <path
                d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z"
                fill="currentColor"
                fillRule="evenodd"
                clipRule="evenodd"
            ></path>
        </svg>
    );
};
