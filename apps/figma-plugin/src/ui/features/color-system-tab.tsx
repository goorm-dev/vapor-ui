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
import { getColorLightness } from '@vapor-ui/color-generator';
import { Box, Button, Collapsible, HStack, VStack } from '@vapor-ui/core';
import { generateColorCSS } from '@vapor-ui/css-generator';
import { ChevronDownOutlineIcon, ConfirmOutlineIcon } from '@vapor-ui/icons';

import { Logger } from '~/common/logger';
import { postMessage } from '~/common/messages';
import { ColorInput } from '~/ui/components/color-input';
import { LabeledInput } from '~/ui/components/labeled-input';
import { RangeSlider } from '~/ui/components/range-slider';
import { Section } from '~/ui/components/section';

export const ColorSystemTab = () => {
    // Key Colors (10 colors, excluding gray)
    const [keyColors, setKeyColors] = useState<Record<string, string>>({
        ...DEFAULT_KEY_COLORS,
    });

    // Primary Color (Required - always enabled with default blue)
    const [primaryColorName, setPrimaryColorName] = useState<string>('blue');
    const [primaryColorHex, setPrimaryColorHex] = useState<string>(DEFAULT_KEY_COLORS.blue);

    // Background Color (Required - always enabled with default gray/white)
    const [backgroundName, setBackgroundName] = useState<string>('gray');
    const [backgroundHex, setBackgroundHex] = useState<string>(DEFAULT_KEY_COLORS.gray);
    const [lightness, setLightness] = useState<{ light: number; dark: number }>({
        light: 100,
        dark: 14,
    });

    // Contrast Ratios (optional, 10 values)
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
        const actualLightness = getColorLightness(backgroundHex);

        if (actualLightness !== null) {
            const constrainedLightness = Math.max(88, actualLightness);

            setLightness((prev) => ({
                ...prev,
                light: constrainedLightness,
            }));
        }
    }, [backgroundHex]);

    const handleGeneratePalette = () => {
        try {
            postMessage({
                type: 'palette-generation-started',
                data: {},
            });

            const options: Partial<ThemeOptions> = {
                keyColors,
                contrastRatios,
                brandColor: {
                    name: primaryColorName,
                    hexcode: primaryColorHex,
                },
                backgroundColor: {
                    name: backgroundName,
                    hexcode: backgroundHex,
                    lightness,
                },
            };

            Logger.palette.generating({ options });

            const themeResult = generatePrimitiveColorPalette(options);
            setGeneratedTheme(themeResult);

            Logger.semantic.generating({ primaryColorName, canvasColorName: backgroundName }, {});

            const semanticResult = getSemanticDependentTokens(
                themeResult,
                primaryColorName,
                backgroundName,
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
                keyColors,
                primary: { name: primaryColorName, hexcode: primaryColorHex },
                background: {
                    name: backgroundName,
                    hexcode: backgroundHex,
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
                <Section>
                    <Section.Title title="Primary Color" />
                    <Section.Description description="브랜드의 핵심 색상을 지정해요. 기본값은 Vapor의 파란색(blue)이에요." />
                    <VStack gap="$100">
                        <LabeledInput
                            label="Color Name"
                            value={primaryColorName}
                            onChange={setPrimaryColorName}
                            placeholder="blue"
                        />
                        <ColorInput
                            label="Hex Code"
                            value={primaryColorHex}
                            onChange={setPrimaryColorHex}
                            placeholder="#2a72e5"
                        />
                    </VStack>
                </Section>

                <Section>
                    <Section.Title title="Background Color" />
                    <Section.Description description="모든 색상 팔레트의 기준이 되는 배경색을 지정해요. 기본값은 흰색(gray)이에요." />
                    <VStack gap="$100">
                        <LabeledInput
                            label="Color Name"
                            value={backgroundName}
                            onChange={setBackgroundName}
                            placeholder="gray"
                        />
                        <ColorInput
                            label="Hex Code"
                            value={backgroundHex}
                            onChange={setBackgroundHex}
                            placeholder="#FFFFFF"
                        />
                    </VStack>
                </Section>

                <Section>
                    <Section.Title title="Background Lightness" />
                    <Section.Description description="Light/Dark 테마별 배경색의 밝기를 지정해요. 색역 클리핑 방지를 위해 Light는 88~100%, Dark는 0~15%로 제한돼요.\n범위를 벗어나면 가장 어두운(900) 색상이 순수한 검정/흰색으로 왜곡될 수 있어요." />

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
                </Section>

                <Collapsible.Root>
                    <Section isTop>
                        <Collapsible.Trigger className="group flex justify-between w-full items-center">
                            <Section.Title title="Primitive Color" />
                            <ChevronDownOutlineIcon className="transition-transform group-data-[panel-open]:rotate-180" />
                        </Collapsible.Trigger>
                        <Collapsible.Panel>
                            <VStack gap="$100">
                                <Section.Description description="디자인 시스템의 10가지 기본 색상 팔레트(red, blue, green 등)를 생성하는 키 컬러에요.\n각 색상은 Background Color 대비 명암비를 준수하며, 인지적으로 균일한 050~900 단계로 생성돼요." />

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
                                        placeholder="Please enter a hex code"
                                    />
                                ))}
                            </VStack>
                        </Collapsible.Panel>
                    </Section>
                </Collapsible.Root>

                <Collapsible.Root>
                    <Section isTop>
                        <Collapsible.Trigger className="group flex justify-between w-full items-center">
                            <Section.Title title="Contrast Ratios" />
                            <ChevronDownOutlineIcon className="transition-transform group-data-[panel-open]:rotate-180" />
                        </Collapsible.Trigger>
                        <Collapsible.Panel>
                            <VStack gap="$100">
                                <Section.Description description="각 색상 단계(050~900)가 배경색 대비 가져야 할 명암비 값이에요. 기본값은 WCAG 접근성 기준을 준수해요.\n500(4.5:1)은 WCAG AA, 700(8.5:1)은 WCAG AAA 기준을 충족하는 값이에요." />

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
                                            type="number"
                                            min="1"
                                            max="21"
                                            step="0.1"
                                        />
                                    ))}
                            </VStack>
                        </Collapsible.Panel>
                    </Section>
                </Collapsible.Root>

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
                                Primary Color: {primaryColorName} ({primaryColorHex})
                            </div>
                            <div className="text-xs text-gray-600 mb-1">
                                Background: {backgroundName} ({backgroundHex})
                            </div>
                            <div className="text-xs text-gray-600">
                                Lightness - Light: {lightness.light}% / Dark: {lightness.dark}%
                            </div>
                        </Box>

                        <HStack gap="$200">
                            <Button
                                onClick={handleCreateFigmaVariables}
                                variant="outline"
                                color="secondary"
                                className="w-full"
                            >
                                Create Figma Variables
                            </Button>
                            <Button
                                onClick={handleCopyCssVariables}
                                variant="outline"
                                color="primary"
                                className="w-full"
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
