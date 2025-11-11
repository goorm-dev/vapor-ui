import { useEffect, useState } from 'react';

import {
    type ContrastRatios,
    DEFAULT_CONTRAST_RATIOS,
    DEFAULT_KEY_COLORS,
    type SemanticResult,
    type ThemeOptions,
    type ThemeResult,
    generatePrimitiveColorPalette,
    getSemanticDependentTokens,
} from '@vapor-ui/color-generator';
import { Box, Button, HStack, VStack } from '@vapor-ui/core';
import { generateColorCSS } from '@vapor-ui/css-generator';
import { ConfirmOutlineIcon } from '@vapor-ui/icons';

import { Logger } from '~/common/logger';
import { postMessage } from '~/common/messages';
import { ColorInput } from '~/ui/components/color-input';
import { LabeledInput } from '~/ui/components/labeled-input';
import { RangeSlider } from '~/ui/components/range-slider';
import { Section } from '~/ui/components/section';
import { getColorLightness } from '~/ui/utils/color-metrics';

const { gray, ...DEFAULT_KEY_COLORS_EXCLUDING_GRAY } = DEFAULT_KEY_COLORS;

export const ColorSystemTab = () => {
    // Key Colors (10 colors, excluding gray)
    const [keyColors, setKeyColors] = useState<Record<string, string>>({
        ...DEFAULT_KEY_COLORS_EXCLUDING_GRAY,
    });

    // Brand Color (optional)
    const [isBrandColorEnabled, setIsBrandColorEnabled] = useState<boolean>(false);
    const [brandColorName, setBrandColorName] = useState<string>('mint');
    const [brandColorHex, setBrandColorHex] = useState<string>('#70f0ae');

    // Reference Background (required)
    const [isCustomBackgroundEnabled, setIsCustomBackgroundEnabled] = useState<boolean>(false);
    const [backgroundName, setBackgroundName] = useState<string>('gray');
    const [backgroundHex, setBackgroundHex] = useState<string>(gray);
    const [lightness, setLightness] = useState<{ light: number; dark: number }>({
        light: 100,
        dark: 14,
    });

    // Contrast Ratios (required, 10 values)
    const [contrastRatios, setContrastRatios] = useState<ContrastRatios>({
        ...DEFAULT_CONTRAST_RATIOS,
    });

    // Generated results
    const [generatedTheme, setGeneratedTheme] = useState<ThemeResult | null>(null);
    const [semanticTokens, setSemanticTokens] = useState<SemanticResult | null>(null);
    const [collectionName, setCollectionName] = useState<string>('Color Tokens');
    const [isCopying, setIsCopying] = useState<boolean>(false);

    // Dynamic lightness calculation when background color changes
    useEffect(() => {
        if (isCustomBackgroundEnabled) {
            const actualLightness = getColorLightness(backgroundHex);

            if (actualLightness !== null) {
                const constrainedLightness = Math.max(88, actualLightness);

                setLightness((prev) => ({
                    ...prev,
                    light: constrainedLightness,
                }));
            }
        }
    }, [backgroundHex, isCustomBackgroundEnabled]);

    const handleGeneratePalette = () => {
        try {
            postMessage({
                type: 'palette-generation-started',
                data: {},
            });

            const options: Partial<ThemeOptions> = {
                keyColors,
                contrastRatios,
            };

            if (isBrandColorEnabled) {
                options.brandColor = {
                    name: brandColorName,
                    hexcode: brandColorHex,
                };
            }

            if (isCustomBackgroundEnabled) {
                options.keyColors = {
                    ...options.keyColors,
                    gray: gray,
                };
                options.backgroundColor = {
                    name: backgroundName,
                    hexcode: backgroundHex,
                    lightness,
                };
            } else {
                options.backgroundColor = {
                    name: 'gray',
                    hexcode: gray,
                    lightness,
                };
            }

            Logger.palette.generating({ options });

            const themeResult = generatePrimitiveColorPalette(options);
            setGeneratedTheme(themeResult);

            const primaryColorName = isBrandColorEnabled ? brandColorName : 'blue';
            const canvasColorName = isCustomBackgroundEnabled ? backgroundName : 'gray';

            Logger.semantic.generating({ primaryColorName, canvasColorName }, {});

            const semanticResult = getSemanticDependentTokens(
                themeResult,
                primaryColorName,
                canvasColorName,
            );

            Logger.semantic.generated(semanticResult);
            setSemanticTokens(semanticResult);

            postMessage({
                type: 'create-unified-palette-sections',
                data: {
                    generatedTheme: themeResult,
                    semanticTokens: semanticResult,
                },
            });

            Logger.palette.generated('통합 팔레트 UI 요청 전송 완료');
        } catch (error) {
            Logger.palette.error('팔레트 생성 실패', error);
        }
    };

    const handleCreateFigmaVariables = () => {
        if (!generatedTheme) {
            Logger.warn('팔레트가 생성되지 않았습니다');
            return;
        }

        postMessage({
            type: 'variable-generation-started',
            data: {},
        });

        try {
            Logger.variables.creating(collectionName);

            postMessage({
                type: 'create-unified-figma-variables',
                data: {
                    generatedTheme,
                    collectionName,
                },
            });

            Logger.info('Figma 변수 생성 요청 전송 완료');
        } catch (error) {
            Logger.variables.error('Figma 변수 생성 요청 실패', error);
        }
    };

    const handleCopyCssVariables = async () => {
        if (isCopying || !generatedTheme) return;

        setIsCopying(true);

        try {
            const css = generateColorCSS({
                primary: isBrandColorEnabled
                    ? { name: brandColorName, hexcode: brandColorHex }
                    : { name: 'blue', hexcode: keyColors.blue },
                background: {
                    name: isCustomBackgroundEnabled ? backgroundName : 'gray',
                    hexcode: isCustomBackgroundEnabled ? backgroundHex : gray,
                    lightness,
                },
            });

            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(css);
            } else {
                const textarea = document.createElement('textarea');
                textarea.value = css;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
            }

            setTimeout(() => {
                setIsCopying(false);
            }, 2000);
        } catch (error) {
            Logger.error('CSS 복사 실패', error);
            setIsCopying(false);
        }
    };

    return (
        <VStack gap="$300">
            <VStack gap="$200">
                {/* A. Key Colors Input (Required, 10 colors) */}
                <Section title="Key Colors">
                    <div className="grid grid-cols-1 gap-v-100">
                        {Object.entries(keyColors).map(([colorName, colorValue]) => (
                            <ColorInput
                                key={colorName}
                                label={colorName}
                                value={colorValue}
                                onChange={(value) =>
                                    setKeyColors((prev) => ({
                                        ...prev,
                                        [colorName]: value,
                                    }))
                                }
                            />
                        ))}
                    </div>
                </Section>

                {/* B. Brand Color Input (Optional) */}
                <Section title="Brand Color (Optional)">
                    <div className="space-y-2">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={isBrandColorEnabled}
                                onChange={(e) => setIsBrandColorEnabled(e.target.checked)}
                                className="rounded border-gray-300"
                            />
                            <span className="text-sm text-gray-700">Add Brand Color</span>
                        </label>

                        {isBrandColorEnabled && (
                            <div className="space-y-2 pl-6">
                                <LabeledInput
                                    label="Color Name"
                                    value={brandColorName}
                                    onChange={setBrandColorName}
                                    placeholder="brand"
                                />
                                <ColorInput
                                    label="Hex Code"
                                    value={brandColorHex}
                                    onChange={setBrandColorHex}
                                    placeholder="#70f0ae"
                                />
                            </div>
                        )}
                    </div>
                </Section>

                {/* C. Reference Background Input (Required) */}
                <Section title="Reference Background">
                    <div className="space-y-3">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={isCustomBackgroundEnabled}
                                onChange={(e) => setIsCustomBackgroundEnabled(e.target.checked)}
                                className="rounded border-gray-300"
                            />
                            <span className="text-sm text-gray-700">Customize Background</span>
                        </label>

                        {isCustomBackgroundEnabled && (
                            <div className="space-y-2 pl-6">
                                <LabeledInput
                                    label="Background Name"
                                    value={backgroundName}
                                    onChange={setBackgroundName}
                                    placeholder="bg"
                                />
                                <ColorInput
                                    label="Background Hex"
                                    value={backgroundHex}
                                    onChange={setBackgroundHex}
                                    placeholder="#FFFFFF"
                                />
                            </div>
                        )}

                        {/* Lightness Sliders */}
                        <div className="space-y-2">
                            {isCustomBackgroundEnabled && (
                                <div className="mb-2 text-xs text-gray-600">
                                    Base Color Lightness:{' '}
                                    {(() => {
                                        const currentLightness = getColorLightness(backgroundHex);
                                        return currentLightness !== null
                                            ? `${currentLightness}%`
                                            : 'Invalid';
                                    })()}
                                </div>
                            )}
                            <RangeSlider
                                label="Light Theme"
                                value={lightness.light}
                                onChange={(value) =>
                                    setLightness((prev) => ({
                                        ...prev,
                                        light: value,
                                    }))
                                }
                                min={88} // [Constraint]: gamut clipping prevention
                                max={100}
                            />
                            <RangeSlider
                                label="Dark Theme"
                                value={lightness.dark}
                                onChange={(value) =>
                                    setLightness((prev) => ({
                                        ...prev,
                                        dark: value,
                                    }))
                                }
                                min={0} // [Constraint]: gamut clipping prevention
                                max={15}
                            />
                        </div>
                    </div>
                </Section>

                {/* D. Contrast Ratios Input (Required, 10 values) */}
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

            {/* Results Section */}
            {generatedTheme && semanticTokens && (
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
                                Palette Generated
                            </div>
                            <div className="text-xs text-gray-600 mb-1">
                                Key Colors: {Object.keys(keyColors).length}
                                {isBrandColorEnabled && ` + Brand: ${brandColorName}`}
                            </div>
                            <div className="text-xs text-gray-600">
                                Background: {isCustomBackgroundEnabled ? backgroundName : 'gray'}
                                (Light: {lightness.light}% / Dark: {lightness.dark}%)
                            </div>
                        </Box>

                        <HStack gap="$200">
                            <Button
                                onClick={handleCreateFigmaVariables}
                                variant="outline"
                                color="secondary"
                                stretch
                            >
                                Create Figma Variables
                            </Button>
                            <Button
                                onClick={handleCopyCssVariables}
                                variant="outline"
                                color="primary"
                                stretch
                                disabled={isCopying}
                            >
                                {isCopying ? <ConfirmOutlineIcon /> : 'Copy CSS Variables'}
                            </Button>
                        </HStack>
                    </VStack>
                </>
            )}
        </VStack>
    );
};
