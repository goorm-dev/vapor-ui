import { type ReactNode, useState } from 'react';

import {
    type ColorPaletteCollection,
    generateSemanticColorPalette,
    generateSemanticDependentTokens,
    type SemanticColorGeneratorConfig,
} from '@vapor-ui/color-generator';
import { Box, Button, Text, VStack } from '@vapor-ui/core';

import { postMessage } from '~/common/messages';
import { Logger } from '~/common/logger';

const DEFAULT_PRIMARY_COLOR = '#8662F3';

const Section = ({ title, children }: { title: string; children: ReactNode }) => {
    return (
        <VStack gap="$100" className="flex-1">
            <Text typography="heading6">{title}</Text>
            {children}
        </VStack>
    );
};

export const SemanticColorsTab = () => {
    const [primaryColor, setPrimaryColor] = useState<string>(DEFAULT_PRIMARY_COLOR);
    const [generatedSemanticPalette, setGeneratedSemanticPalette] = useState<Pick<
        ColorPaletteCollection,
        'light' | 'dark'
    > | null>(null);
    const [collectionName, setCollectionName] = useState<string>('Semantic Color Tokens');

    const handleGenerateSemanticPalette = () => {
        try {
            Logger.semantic.generating({ primary: primaryColor }, null);

            const config: SemanticColorGeneratorConfig = {
                colors: {
                    primary: primaryColor,
                },
            };

            const semanticPalette = generateSemanticColorPalette(config);

            const dependentTokens = generateSemanticDependentTokens(semanticPalette);

            setGeneratedSemanticPalette(semanticPalette);

            postMessage({
                type: 'create-semantic-palette-sections',
                data: {
                    generatedSemanticPalette: semanticPalette,
                    dependentTokens: dependentTokens,
                },
            });

            Logger.semantic.generated('시맨틱 팔레트 UI 요청 전송 완료');
        } catch (error) {
            Logger.semantic.error('시맨틱 팔레트 생성 실패', error);
        }
    };

    const handleCreateSemanticFigmaVariables = () => {
        if (!generatedSemanticPalette) {
            Logger.warn('시맨틱 팔레트가 생성되지 않았습니다');
            return;
        }

        try {
            Logger.variables.creating(collectionName);
            
            postMessage({
                type: 'create-semantic-figma-variables',
                data: { generatedSemanticPalette, collectionName },
            });
            
            Logger.info('시맨틱 Figma 변수 생성 요청 전송 완료');
        } catch (error) {
            Logger.variables.error('시맨틱 Figma 변수 생성 요청 실패', error);
        }
    };

    return (
        <VStack gap="$300">
            <VStack gap="$200">
                <Section title="Primary Color">
                    <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-600 min-w-[50px]">Primary:</label>
                        <input
                            type="text"
                            value={primaryColor}
                            onChange={(e) => setPrimaryColor(e.target.value)}
                            className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder={DEFAULT_PRIMARY_COLOR}
                        />
                        <input
                            type="color"
                            value={primaryColor}
                            onChange={(e) => setPrimaryColor(e.target.value)}
                            className="w-6 h-6 border border-gray-300 rounded cursor-pointer"
                            title="Pick primary color"
                        />
                    </div>
                </Section>

                <Button onClick={handleGenerateSemanticPalette}>Generate Semantic Palette</Button>
            </VStack>

            {generatedSemanticPalette && (
                <>
                    <div className="border-t border-gray-300" />
                    <VStack gap="$200">
                        <div className="flex items-center gap-2">
                            <label className="text-xs text-gray-600 min-w-[80px]">
                                Collection Name:
                            </label>
                            <input
                                type="text"
                                value={collectionName}
                                onChange={(e) => setCollectionName(e.target.value)}
                                className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="Enter collection name"
                            />
                        </div>

                        <Box className="p-3 bg-v-gray-100 rounded-lg">
                            <div className="text-sm font-medium text-gray-700 mb-2">
                                Semantic Palette Generated
                            </div>
                            <div className="text-xs text-gray-600">
                                Primary color: <span className="font-medium">{primaryColor}</span>
                            </div>
                        </Box>

                        <Button
                            onClick={handleCreateSemanticFigmaVariables}
                            variant="outline"
                            color="primary"
                        >
                            Create Semantic Figma Variables
                        </Button>
                    </VStack>
                </>
            )}
        </VStack>
    );
};
