import { Box, Text } from '@vapor-ui/core';

import { ColorPalette } from '../color-swatch';

export const SemanticColor = () => {
    return (
        <Box paddingY="$400">
            <Text typography="heading5">Background Colors</Text>

            <ColorPalette
                colors={[
                    { name: 'Background Primary 100', variable: 'background-primary-100' },
                    {
                        name: 'Background Primary 200',
                        variable: 'background-primary-200',
                        foreground: 'gray-050',
                    },
                    { name: 'Background Secondary 100', variable: 'background-secondary-100' },
                    {
                        name: 'Background Secondary 200',
                        variable: 'background-secondary-200',
                        foreground: 'gray-900',
                    },
                    { name: 'Background Success 100', variable: 'background-success-100' },
                    {
                        name: 'Background Success 200',
                        variable: 'background-success-200',
                        foreground: 'gray-050',
                    },
                    { name: 'Background Warning 100', variable: 'background-warning-100' },
                    {
                        name: 'Background Warning 200',
                        variable: 'background-warning-200',
                        foreground: 'gray-050',
                    },
                    { name: 'Background Danger 100', variable: 'background-danger-100' },
                    {
                        name: 'Background Danger 200',
                        variable: 'background-danger-200',
                        foreground: 'gray-050',
                    },
                    { name: 'Background Hint 100', variable: 'background-hint-100' },
                    {
                        name: 'Background Hint 200',
                        variable: 'background-hint-200',
                        foreground: 'gray-050',
                    },
                    { name: 'Background Contrast 100', variable: 'background-contrast-100' },
                    {
                        name: 'Background Contrast 200',
                        variable: 'background-contrast-200',
                        foreground: 'gray-050',
                    },
                    {
                        name: 'Background Canvas 100',
                        variable: 'background-canvas-100',
                        foreground: 'gray-900',
                    },
                    {
                        name: 'Background Canvas 200',
                        variable: 'background-canvas-200',
                        foreground: 'gray-900',
                    },
                    {
                        name: 'Background Overlay 100',
                        variable: 'background-overlay-100',
                        foreground: 'gray-900',
                    },
                ]}
            />

            <Text typography="heading5">Foreground Colors</Text>

            <ColorPalette
                colors={[
                    {
                        name: 'Foreground Primary 100',
                        variable: 'foreground-primary-100',
                        foreground: 'gray-050',
                    },
                    {
                        name: 'Foreground Primary 200',
                        variable: 'foreground-primary-200',
                        foreground: 'gray-050',
                    },
                    {
                        name: 'Foreground Secondary 100',
                        variable: 'foreground-secondary-100',
                        foreground: 'gray-050',
                    },
                    {
                        name: 'Foreground Secondary 200',
                        variable: 'foreground-secondary-200',
                        foreground: 'gray-050',
                    },
                    {
                        name: 'Foreground Success 100',
                        variable: 'foreground-success-100',
                        foreground: 'gray-050',
                    },
                    {
                        name: 'Foreground Success 200',
                        variable: 'foreground-success-200',
                        foreground: 'gray-050',
                    },
                    {
                        name: 'Foreground Warning 100',
                        variable: 'foreground-warning-100',
                        foreground: 'gray-050',
                    },
                    {
                        name: 'Foreground Warning 200',
                        variable: 'foreground-warning-200',
                        foreground: 'gray-050',
                    },
                    {
                        name: 'Foreground Danger 100',
                        variable: 'foreground-danger-100',
                        foreground: 'gray-050',
                    },
                    {
                        name: 'Foreground Danger 200',
                        variable: 'foreground-danger-200',
                        foreground: 'gray-050',
                    },
                    {
                        name: 'Foreground Hint 100',
                        variable: 'foreground-hint-100',
                        foreground: 'gray-050',
                    },
                    {
                        name: 'Foreground Hint 200',
                        variable: 'foreground-hint-200',
                        foreground: 'gray-050',
                    },
                    {
                        name: 'Foreground Contrast 100',
                        variable: 'foreground-contrast-100',
                        foreground: 'gray-050',
                    },
                    {
                        name: 'Foreground Contrast 200',
                        variable: 'foreground-contrast-200',
                        foreground: 'gray-050',
                    },
                    {
                        name: 'Foreground Normal 100',
                        variable: 'foreground-normal-100',
                        foreground: 'gray-050',
                    },
                    {
                        name: 'Foreground Normal 200',
                        variable: 'foreground-normal-200',
                        foreground: 'gray-050',
                    },
                ]}
            />

            <Text typography="heading5">Border Colors</Text>

            <ColorPalette
                colors={[
                    { name: 'Border Primary', variable: 'border-primary', foreground: 'gray-050' },
                    {
                        name: 'Border Secondary',
                        variable: 'border-secondary',
                        foreground: 'gray-900',
                    },
                    { name: 'Border Success', variable: 'border-success', foreground: 'gray-050' },
                    { name: 'Border Warning', variable: 'border-warning', foreground: 'gray-050' },
                    { name: 'Border Danger', variable: 'border-danger', foreground: 'gray-050' },
                    { name: 'Border Hint', variable: 'border-hint', foreground: 'gray-050' },
                    {
                        name: 'Border Contrast',
                        variable: 'border-contrast',
                        foreground: 'gray-050',
                    },
                    { name: 'Border Normal', variable: 'border-normal', foreground: 'gray-900' },
                ]}
            />

            <Text typography="heading5">Logo Colors</Text>

            <ColorPalette colors={[{ name: 'Logo', variable: 'logo-normal' }]} />
        </Box>
    );
};
