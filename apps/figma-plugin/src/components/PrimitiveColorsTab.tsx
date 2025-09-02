import { type ReactNode, useState } from 'react';

import {
    type ColorPaletteCollection,
    DEFAULT_CONTRAST_RATIOS,
    DEFAULT_MAIN_BACKGROUND_LIGHTNESS,
    DEFAULT_PRIMITIVE_COLORS,
    generateColorPalette,
} from '@vapor-ui/color-generator';
import { Button, Text, VStack } from '@vapor-ui/core';

import { postMessage } from '../figma-messages';
import { calculatePerceptualUniformity } from '../utils/colorMetrics';

const Section = ({ title, children }: { title: string; children: ReactNode }) => {
    return (
        <VStack gap="$100" className="flex-1">
            <Text typography="heading6">{title}</Text>
            {children}
        </VStack>
    );
};

export const PrimitiveColorsTab = () => {
    const [backgroundLightness, setBackgroundLightness] = useState<{ light: number; dark: number }>(
        {
            light: DEFAULT_MAIN_BACKGROUND_LIGHTNESS.light,
            dark: DEFAULT_MAIN_BACKGROUND_LIGHTNESS.dark,
        },
    );
    const [contrastRatios, setContrastRatios] = useState<Record<string, number>>({
        ...DEFAULT_CONTRAST_RATIOS,
    });
    const [primitiveColors, setPrimitiveColors] = useState<Record<string, string>>({
        ...DEFAULT_PRIMITIVE_COLORS,
    });
    const [generatedPalette, setGeneratedPalette] = useState<ColorPaletteCollection | null>(null);

    const handleGeneratePalette = () => {
        try {
            const config = {
                primitiveColors,
                contrastRatios,
                backgroundLightness,
            };

            const palette = generateColorPalette(config);
            setGeneratedPalette(palette);

            console.log('Generating palette with config:', config);

            postMessage({
                type: 'create-palette-sections',
                data: { generatedPalette: palette },
            });
        } catch (error) {
            console.error('Error generating palette:', error);
        }
    };
    return (
        <VStack gap="$200">
            <Section title="Key Colors">
                <div className="grid grid-cols-1 gap-v-100">
                    {Object.entries(primitiveColors).map(([colorName, colorValue]) => (
                        <div key={colorName} className="flex items-center gap-2">
                            <label className="text-xs text-gray-600 min-w-[40px] capitalize">
                                {colorName}:
                            </label>
                            <input
                                type="text"
                                value={colorValue}
                                onChange={(e) =>
                                    setPrimitiveColors((prev) => ({
                                        ...prev,
                                        [colorName]: e.target.value,
                                    }))
                                }
                                className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="#000000"
                            />
                            <input
                                type="color"
                                value={colorValue}
                                onChange={(e) =>
                                    setPrimitiveColors((prev) => ({
                                        ...prev,
                                        [colorName]: e.target.value,
                                    }))
                                }
                                className="w-6 h-6 border border-gray-300 rounded cursor-pointer"
                                title={`Pick ${colorName} color`}
                            />
                        </div>
                    ))}
                </div>
            </Section>

            <Section title="Background Lightness">
                <div className="mb-2">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-600">Light Theme:</span>
                        <span className="text-xs text-gray-600">{backgroundLightness.light}</span>
                    </div>
                    <input
                        type="range"
                        min="85"
                        max="100"
                        value={backgroundLightness.light}
                        onChange={(e) =>
                            setBackgroundLightness((prev) => ({
                                ...prev,
                                light: Number(e.target.value),
                            }))
                        }
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                </div>
                <div className="mb-2">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-600">Dark Theme:</span>
                        <span className="text-xs text-gray-600">{backgroundLightness.dark}</span>
                    </div>
                    <input
                        type="range"
                        min="5"
                        max="25"
                        value={backgroundLightness.dark}
                        onChange={(e) =>
                            setBackgroundLightness((prev) => ({
                                ...prev,
                                dark: Number(e.target.value),
                            }))
                        }
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                </div>
            </Section>

            <Section title="Contrast Ratios">
                <div className="grid grid-cols-2 gap-3">
                    {Object.entries(contrastRatios).map(([shade, ratio]) => (
                        <div key={shade} className="flex items-center gap-2">
                            <label className="text-xs text-gray-600 min-w-[28px]">{shade}:</label>
                            <input
                                type="number"
                                min="1"
                                max="21"
                                step="0.1"
                                value={ratio}
                                onChange={(e) =>
                                    setContrastRatios((prev) => ({
                                        ...prev,
                                        [shade]: Number(e.target.value),
                                    }))
                                }
                                className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                    ))}
                </div>
            </Section>

            {/* Perceptual Uniformity Metrics */}
            {generatedPalette &&
                (() => {
                    const metrics = calculatePerceptualUniformity(generatedPalette);
                    return metrics ? (
                        <div className="p-3 bg-v-gray-100 rounded-lg">
                            <div className="text-sm font-medium text-gray-700 mb-2">
                                Perceptual Uniformity
                            </div>
                            <div className="text-xs text-gray-600 mb-1">
                                Uniformity Score:{' '}
                                <span className="font-medium">{metrics.uniformity}%</span>
                            </div>
                            <div className="text-xs text-gray-600">
                                Lightness Range: {metrics.lightnessRange.min} -{' '}
                                {metrics.lightnessRange.max}
                            </div>
                        </div>
                    ) : null;
                })()}

            <div className="border-t border-gray-300" />

            <Button onClick={handleGeneratePalette}>Generate Palette</Button>
        </VStack>
    );
};
