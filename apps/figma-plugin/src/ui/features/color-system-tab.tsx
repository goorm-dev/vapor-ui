import { useMemo, useState } from 'react';

import type { SemanticResult, ThemeOptions, ThemeResult } from '@vapor-ui/color-generator';
import {
    LEONARDO_KEYS,
    generatePrimitiveColorPalette,
    getSemanticDependentTokens,
    validatePalette,
} from '@vapor-ui/color-generator';
import { Box, Button, Collapsible, HStack, VStack } from '@vapor-ui/core';
import { generateColorCSS } from '@vapor-ui/css-generator';
import { ChevronDownOutlineIcon, ConfirmOutlineIcon } from '@vapor-ui/icons';

import { Logger } from '~/common/logger';
import { postMessage } from '~/common/messages';
import { AccessibilityWarning } from '~/ui/components/accessibility-warning';
import { ColorInput } from '~/ui/components/color-input';
import { LabeledInput } from '~/ui/components/labeled-input';
import { Section } from '~/ui/components/section';

// 각 기본 색상의 키 컬러 3개 중 가운데 값을 대표 HEX로 편집합니다.
const DEFAULT_BASIC_COLORS = Object.fromEntries(
    Object.entries(LEONARDO_KEYS).map(([name, keys]) => [name, `#${keys[1]}`]),
);

// HEX 하나는 키 컬러를 다시 유도하므로, 기본값과 다른 색상만 넘겨야 기본 팔레트가 유지됩니다.
// primary는 brandColor로 따로 넘기므로 같은 이름을 basicColors에서 뺍니다(중복 이름은 throw).
const changedBasicColors = (colors: Record<string, string>, primaryName: string) =>
    Object.entries(colors)
        .filter(
            ([name, hex]) =>
                name !== primaryName &&
                hex.toUpperCase() !== DEFAULT_BASIC_COLORS[name]?.toUpperCase(),
        )
        .map(([name, hexcode]) => ({ name, hexcode }));

export const ColorSystemTab = () => {
    // Basic Colors (11 base colors)
    const [basicColors, setBasicColors] = useState<Record<string, string>>(DEFAULT_BASIC_COLORS);

    // Primary Color (Required - always enabled with default blue)
    const [primaryColorName, setPrimaryColorName] = useState<string>('blue');
    const [primaryColorHex, setPrimaryColorHex] = useState<string>(DEFAULT_BASIC_COLORS.blue);

    // Generated results
    const [generatedTheme, setGeneratedTheme] = useState<ThemeResult | null>(null);
    const [semanticTokens, setSemanticTokens] = useState<SemanticResult | null>(null);
    const [collectionName, setCollectionName] = useState<string>('Color Tokens');
    const [isCopying, setIsCopying] = useState<boolean>(false);

    const paletteChecks = useMemo(
        () => (generatedTheme ? validatePalette(generatedTheme) : []),
        [generatedTheme],
    );

    const handleGeneratePalette = () => {
        try {
            postMessage({
                type: 'palette-generation-started',
                data: {},
            });

            const options: ThemeOptions = {
                basicColors: changedBasicColors(basicColors, primaryColorName),
                brandColor: {
                    name: primaryColorName,
                    hexcode: primaryColorHex,
                },
            };

            Logger.palette.generating({ options });

            const themeResult = generatePrimitiveColorPalette(options);
            setGeneratedTheme(themeResult);

            Logger.semantic.generating({ primaryColorName }, {});

            const semanticResult = getSemanticDependentTokens(themeResult, primaryColorName);

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
                basicColors: changedBasicColors(basicColors, primaryColorName),
                primary: { name: primaryColorName, hexcode: primaryColorHex },
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
        <VStack $css={{ gap: '$300' }}>
            <VStack $css={{ gap: '$200' }}>
                <Section>
                    <Section.Title title="Primary Color" />
                    <Section.Description description="브랜드의 핵심 색상을 지정해요. 기본값은 Vapor의 파란색(blue)이에요." />
                    <VStack $css={{ gap: '$100' }}>
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

                <Collapsible.Root>
                    <Section isTop>
                        <Collapsible.Trigger className="group flex justify-between w-full items-center">
                            <Section.Title title="Primitive Color" />
                            <ChevronDownOutlineIcon className="transition-transform group-data-[panel-open]:rotate-180" />
                        </Collapsible.Trigger>
                        <Collapsible.Panel>
                            <VStack $css={{ gap: '$100' }}>
                                <Section.Description description="디자인 시스템의 11가지 기본 색상 팔레트(red, blue, green 등)를 생성하는 대표 색상이에요.\n각 색상은 고정 배경(light #FFFFFF, dark #232323) 대비 목표 명암비로 050~900 단계가 생성돼요." />

                                {Object.entries(basicColors).map(([colorName, colorValue]) => (
                                    <ColorInput
                                        key={colorName}
                                        label={colorName}
                                        value={colorValue}
                                        onChange={(value) =>
                                            setBasicColors((prev) => ({
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

                <Button onClick={handleGeneratePalette}>Generate Palette</Button>
            </VStack>

            {/* Results Section */}
            {generatedTheme && semanticTokens && (
                <>
                    <div className="border-t border-gray-300" />
                    <VStack $css={{ gap: '$200' }}>
                        {/* 접근성 경고 */}
                        <AccessibilityWarning checks={paletteChecks} />

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
                            <div className="text-xs text-gray-600">
                                Primary Color: {primaryColorName} ({primaryColorHex})
                            </div>
                        </Box>

                        <HStack $css={{ gap: '$200' }}>
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
