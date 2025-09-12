import { useState } from 'react';

import {
    type ColorGeneratorConfig,
    type ColorPaletteResult,
    DEFAULT_CONTRAST_RATIOS,
    DEFAULT_MAIN_BACKGROUND_LIGHTNESS,
    DEFAULT_PRIMITIVE_COLORS,
    generateSystemColorPalette,
} from '@vapor-ui/color-generator';
import { Box, Button, VStack } from '@vapor-ui/core';

import { Logger } from '~/common/logger';
import { postMessage } from '~/common/messages';
import { ColorInput } from '~/ui/components/color-input';
import { LabeledInput } from '~/ui/components/labeled-input';
import { RangeSlider } from '~/ui/components/range-slider';
import { Section } from '~/ui/components/section';
import { calculatePerceptualUniformity } from '~/ui/utils/color-metrics';

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
    const [generatedPalette, setGeneratedPalette] = useState<ColorPaletteResult | null>(null);
    const [collectionName, setCollectionName] = useState<string>('Color Tokens');

    const handleGeneratePalette = () => {
        try {
            const config: ColorGeneratorConfig = {
                colors: primitiveColors,
                contrastRatios,
                backgroundLightness,
            };
            Logger.palette.generating(config);

            const palette = generateSystemColorPalette(config);
            setGeneratedPalette(palette);

            postMessage({
                type: 'create-palette-sections',
                data: { generatedPalette: palette },
            });

            Logger.palette.generated('팔레트 UI 요청 전송 완료');
        } catch (error) {
            Logger.palette.error('팔레트 생성 실패', error);
        }
    };

    const handleCreateFigmaVariables = () => {
        if (!generatedPalette) {
            Logger.warn('팔레트가 생성되지 않았습니다');
            return;
        }

        try {
            Logger.variables.creating(collectionName);

            postMessage({
                type: 'create-figma-variables',
                data: { generatedPalette, collectionName },
            });

            Logger.info('Figma 변수 생성 요청 전송 완료');
        } catch (error) {
            Logger.variables.error('Figma 변수 생성 요청 실패', error);
        }
    };

    return (
        <VStack gap="$300">
            <VStack gap="$200">
                <Section title="Key Colors">
                    <div className="grid grid-cols-1 gap-v-100">
                        {Object.entries(primitiveColors).map(([colorName, colorValue]) => (
                            <ColorInput
                                key={colorName}
                                label={colorName}
                                value={colorValue}
                                onChange={(value) =>
                                    setPrimitiveColors((prev) => ({
                                        ...prev,
                                        [colorName]: value,
                                    }))
                                }
                            />
                        ))}
                    </div>
                </Section>

                <Section title="Background Lightness">
                    <RangeSlider
                        label="Light Theme"
                        value={backgroundLightness.light}
                        onChange={(value) =>
                            setBackgroundLightness((prev) => ({
                                ...prev,
                                light: value,
                            }))
                        }
                        min={85}
                        max={100}
                    />
                    <RangeSlider
                        label="Dark Theme"
                        value={backgroundLightness.dark}
                        onChange={(value) =>
                            setBackgroundLightness((prev) => ({
                                ...prev,
                                dark: value,
                            }))
                        }
                        min={5}
                        max={25}
                    />
                </Section>

                <Section title="Contrast Ratios">
                    <div className="grid grid-cols-2 gap-3">
                        {Object.entries(contrastRatios)
                            .sort(([a], [b]) => {
                                const numA = parseInt(a, 10);
                                const numB = parseInt(b, 10);
                                return numA - numB;
                            })
                            .map(([shade, ratio]) => (
                                <LabeledInput
                                    key={shade}
                                    label={shade}
                                    value={ratio}
                                    onChange={(value) =>
                                        setContrastRatios((prev) => ({
                                            ...prev,
                                            [shade]: Number(value),
                                        }))
                                    }
                                    labelWidth="min-w-[28px]"
                                    type="number"
                                    min="1"
                                    max="21"
                                    step="0.1"
                                />
                            ))}
                    </div>
                </Section>

                <Button onClick={handleGeneratePalette}>Generate Palette</Button>
            </VStack>

            {generatedPalette &&
                (() => {
                    const metrics = calculatePerceptualUniformity(generatedPalette);
                    return metrics ? (
                        <>
                            <div className="border-t border-gray-300" />
                            <VStack gap="$200">
                                <LabeledInput
                                    label="Collection Name"
                                    value={collectionName}
                                    onChange={setCollectionName}
                                    placeholder="Enter collection name"
                                />

                                <Box className="p-3 bg-v-gray-100 rounded-lg">
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
                                </Box>

                                <Button
                                    onClick={handleCreateFigmaVariables}
                                    variant="outline"
                                    color="primary"
                                >
                                    Create Figma Variables
                                </Button>
                            </VStack>
                        </>
                    ) : null;
                })()}
        </VStack>
    );
};
