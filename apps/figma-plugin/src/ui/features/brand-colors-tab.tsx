import { useState } from 'react';

import {
    type BrandColorGeneratorConfig,
    type ColorPaletteResult,
    type SemanticMappingConfig,
    generateBrandColorPalette,
    getSemanticDependentTokens,
} from '@vapor-ui/color-generator';
import { Box, Button, VStack } from '@vapor-ui/core';

import { Logger } from '~/common/logger';
import { postMessage } from '~/common/messages';
import { ColorInput } from '~/ui/components/color-input';
import { LabeledInput } from '~/ui/components/labeled-input';
import { LabeledSelect } from '~/ui/components/labeled-select';
import { Section } from '~/ui/components/section';

type ThemeColorType = keyof SemanticMappingConfig;

const THEME_COLOR_OPTIONS: { value: ThemeColorType; label: string }[] = [
    { value: 'primary', label: 'Primary' },
    // TODO: 향후 다중 테마 컬러 지원 시 활성화
    // { value: 'secondary', label: 'Secondary' },
    // { value: 'success', label: 'Success' },
    // { value: 'warning', label: 'Warning' },
    // { value: 'error', label: 'Error' },
];

export const BrandColorsTab = () => {
    const [colorName, setColorName] = useState<string>('myBlue');
    const [colorHex, setColorHex] = useState<string>('#8662F3');
    const [themeColorType, setThemeColorType] = useState<ThemeColorType>('primary');
    const [generatedBrandPalette, setGeneratedBrandPalette] = useState<Pick<
        ColorPaletteResult,
        'light' | 'dark'
    > | null>(null);
    const [collectionName, setCollectionName] = useState<string>('Brand Color Tokens');

    const handleGenerateBrandPalette = () => {
        try {
            const config: BrandColorGeneratorConfig = {
                colors: {
                    [colorName]: colorHex,
                },
            };

            const brandPalette = generateBrandColorPalette(config);
            const semanticDependentTokens = getSemanticDependentTokens({
                primary: { name: colorName, hex: colorHex },
            });

            // 실제 구조에 맞게 전체 semanticDependentTokens 전달
            const dependentTokens = semanticDependentTokens;

            Logger.semantic.generating({ primary: colorHex }, dependentTokens);

            setGeneratedBrandPalette(brandPalette);

            postMessage({
                type: 'create-brand-palette-sections',
                data: {
                    generatedBrandPalette: brandPalette,
                    dependentTokens: dependentTokens,
                },
            });

            Logger.semantic.generated('브랜드 팔레트 UI 요청 전송 완료');
        } catch (error) {
            Logger.semantic.error('브랜드 팔레트 생성 실패', error);
        }
    };

    const handleCreateBrandFigmaVariables = () => {
        if (!generatedBrandPalette) {
            Logger.warn('브랜드 팔레트가 생성되지 않았습니다');
            return;
        }

        try {
            Logger.variables.creating(collectionName);

            postMessage({
                type: 'create-brand-figma-variables',
                data: { generatedBrandPalette, collectionName },
            });

            Logger.info('브랜드 Figma 변수 생성 요청 전송 완료');
        } catch (error) {
            Logger.variables.error('브랜드 Figma 변수 생성 요청 실패', error);
        }
    };

    return (
        <VStack gap="$300">
            <VStack gap="$200">
                <Section title="Custom Color">
                    <LabeledInput
                        label="Color Name"
                        value={colorName}
                        onChange={setColorName}
                        placeholder="myBlue"
                    />
                    <ColorInput
                        label="Hex Code"
                        value={colorHex}
                        onChange={setColorHex}
                        placeholder="#8662F3"
                    />
                    <LabeledSelect
                        label="Theme Color Type"
                        value={themeColorType}
                        onChange={setThemeColorType}
                        options={THEME_COLOR_OPTIONS}
                    />
                </Section>

                <Button onClick={handleGenerateBrandPalette}>Generate Palette</Button>
            </VStack>

            {generatedBrandPalette && (
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
                                Brand Palette Generated
                            </div>
                            <div className="text-xs text-gray-600">
                                {
                                    THEME_COLOR_OPTIONS.find((opt) => opt.value === themeColorType)
                                        ?.label
                                }{' '}
                                color: <span className="font-medium">{colorName}</span> ({colorHex})
                            </div>
                        </Box>

                        <Button
                            onClick={handleCreateBrandFigmaVariables}
                            variant="outline"
                            color="primary"
                        >
                            Create Brand Figma Variables
                        </Button>
                    </VStack>
                </>
            )}
        </VStack>
    );
};
