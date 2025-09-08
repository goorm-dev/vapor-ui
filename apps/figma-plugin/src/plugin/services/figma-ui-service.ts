import type {
    ColorPaletteCollection,
    ThemeDependentTokensCollection,
} from '@vapor-ui/color-generator';

import type {
    PaletteCreationRequest,
    SemanticPaletteCreationRequest,
} from '~/plugin/types/palette';
import { formatColorName, formatFamilyTitle, sortColorShades } from '~/plugin/utils/color';
import { hexToFigmaColor } from '~/plugin/utils/color';
import { loadDefaultFont } from '~/plugin/utils/figma-font';
import { Logger } from '~/common/logger';

import { NotificationService } from './figma-notification';

// ============================================================================
// Constants
// ============================================================================
const UI_CONSTANTS = {
    SECTION_OFFSET: 2000,
    SECTION_PADDING: 100,
    SECTION_POSITION: { x: 100, y: 100 },
    PALETTE_SPACING: 32,
    COLOR_ROW_HEIGHT: 56,
    COLOR_SWATCH_SIZE: 32,
    LAYOUT_WIDTHS: {
        STANDARD_ROW: 1200,
        SEMANTIC_ROW: 1400,
        NAME_FIELD: 592,
        SEMANTIC_NAME_FIELD: 400,
        SEMANTIC_TOKEN_FIELD: 400,
    },
} as const;

// ============================================================================
// Public Service
// ============================================================================
export const figmaUIService = {
    /**
     * 기본 팔레트 섹션 생성 (Primitive Colors Tab용)
     */
    async createPrimitivePaletteSections(request: PaletteCreationRequest): Promise<void> {
        try {
            Logger.palette.generating(request.generatedPalette);

            const fontName = await loadDefaultFont();
            const currentPage = figma.currentPage;

            // Light 테마 생성
            if (request.generatedPalette.light) {
                Logger.palette.creatingSection('light');
                const lightSection = createPaletteSection(
                    'light',
                    request.generatedPalette.light,
                    fontName,
                );
                currentPage.appendChild(lightSection);
                Logger.palette.sectionCreated('light');
            }

            // Dark 테마 생성
            if (request.generatedPalette.dark) {
                Logger.palette.creatingSection('dark');
                const darkSection = createPaletteSection(
                    'dark',
                    request.generatedPalette.dark,
                    fontName,
                );
                currentPage.appendChild(darkSection);
                Logger.palette.sectionCreated('dark');
            }

            Logger.palette.generated('팔레트 섹션 생성 완료');
            NotificationService.paletteCreated();
        } catch (error) {
            Logger.palette.error('팔레트 섹션 생성 실패', error);
            NotificationService.paletteCreateFailed();
        }
    },

    /**
     * 시맨틱 팔레트 섹션 생성 (Semantic Colors Tab용)
     */
    async createSemanticPaletteSections(request: SemanticPaletteCreationRequest): Promise<void> {
        try {
            Logger.semantic.generating(request.generatedSemanticPalette, request.dependentTokens);

            const fontName = await loadDefaultFont();
            const currentPage = figma.currentPage;

            // Light 테마 생성
            if (request.generatedSemanticPalette.light && request.dependentTokens.light) {
                Logger.semantic.creatingSection('light');
                const lightSection = createSemanticPaletteSection(
                    'light',
                    request.generatedSemanticPalette.light,
                    request.dependentTokens.light,
                    fontName,
                );
                currentPage.appendChild(lightSection);
                Logger.semantic.sectionCreated('light');
            }

            // Dark 테마 생성
            if (request.generatedSemanticPalette.dark && request.dependentTokens.dark) {
                Logger.semantic.creatingSection('dark');
                const darkSection = createSemanticPaletteSection(
                    'dark',
                    request.generatedSemanticPalette.dark,
                    request.dependentTokens.dark,
                    fontName,
                );
                currentPage.appendChild(darkSection);
                Logger.semantic.sectionCreated('dark');
            }

            Logger.semantic.generated('시맨틱 팔레트 섹션 생성 완료');
            NotificationService.semanticPaletteCreated();
        } catch (error) {
            Logger.semantic.error('시맨틱 팔레트 섹션 생성 실패', error);
            NotificationService.semanticPaletteCreateFailed();
        }
    },
} as const;

// ============================================================================
// Figma UI Helpers
// ============================================================================
function createPaletteSection(
    theme: 'light' | 'dark',
    themeData: ColorPaletteCollection['light'],
    fontName: FontName,
): SectionNode {
    const section = figma.createSection();
    section.name = `${theme} (Generated)`;

    const offset = theme === 'light' ? 0 : UI_CONSTANTS.SECTION_OFFSET;
    section.x = UI_CONSTANTS.SECTION_POSITION.x + offset;
    section.y = UI_CONSTANTS.SECTION_POSITION.y;

    const paletteTable = createPaletteTable(themeData, theme, fontName);
    if (paletteTable) {
        section.appendChild(paletteTable);
        section.resizeWithoutConstraints(
            paletteTable.width + UI_CONSTANTS.SECTION_PADDING,
            paletteTable.height + UI_CONSTANTS.SECTION_PADDING,
        );
    } else {
        section.resizeWithoutConstraints(1500, 500);
    }

    return section;
}

function createSemanticPaletteSection(
    theme: 'light' | 'dark',
    themeData: ColorPaletteCollection['light'],
    semanticTokens: ThemeDependentTokensCollection['light'],
    fontName: FontName,
): SectionNode {
    const section = figma.createSection();
    section.name = `${theme} Semantic (Generated)`;

    const offset = theme === 'light' ? 0 : UI_CONSTANTS.SECTION_OFFSET;
    section.x = UI_CONSTANTS.SECTION_POSITION.x + offset;
    section.y = UI_CONSTANTS.SECTION_POSITION.y;

    const paletteTable = createSemanticPaletteTable(themeData, semanticTokens, theme, fontName);
    if (paletteTable) {
        section.appendChild(paletteTable);
        section.resizeWithoutConstraints(
            paletteTable.width + UI_CONSTANTS.SECTION_PADDING,
            paletteTable.height + UI_CONSTANTS.SECTION_PADDING,
        );
    } else {
        section.resizeWithoutConstraints(1500, 500);
    }

    return section;
}

function createPaletteTable(
    generatedThemeData: ColorPaletteCollection['light'],
    theme: string,
    fontName: FontName,
): FrameNode {
    const mainFrame = figma.createFrame();
    mainFrame.name = 'Generated Palette';
    mainFrame.x = UI_CONSTANTS.SECTION_POSITION.x;
    mainFrame.y = UI_CONSTANTS.SECTION_POSITION.y;
    mainFrame.fills = [];

    // Auto layout 설정
    mainFrame.layoutMode = 'VERTICAL';
    mainFrame.itemSpacing = UI_CONSTANTS.PALETTE_SPACING;
    mainFrame.paddingTop = UI_CONSTANTS.PALETTE_SPACING;
    mainFrame.paddingBottom = UI_CONSTANTS.PALETTE_SPACING;
    mainFrame.paddingLeft = 64;
    mainFrame.paddingRight = 64;
    mainFrame.primaryAxisSizingMode = 'AUTO';
    mainFrame.counterAxisSizingMode = 'AUTO';

    // 헤더 생성
    const header = createPaletteHeader(theme, fontName);
    mainFrame.appendChild(header);

    // 컬러 패밀리별 섹션 생성
    Object.entries(generatedThemeData).forEach(([colorFamily, colorShades]) => {
        if (colorFamily === 'background') {
            const bgSection = createColorFamilySection(colorFamily, colorShades, true, fontName);
            mainFrame.appendChild(bgSection);
        } else if (typeof colorShades === 'object' && colorShades !== null) {
            const colorSection = createColorFamilySection(
                colorFamily,
                colorShades,
                false,
                fontName,
            );
            mainFrame.appendChild(colorSection);
        }
    });

    return mainFrame;
}

function createSemanticPaletteTable(
    generatedThemeData: ColorPaletteCollection['light'],
    semanticTokens: ThemeDependentTokensCollection['light'],
    theme: string,
    fontName: FontName,
): FrameNode {
    const mainFrame = figma.createFrame();
    mainFrame.name = 'Generated Semantic Palette';
    mainFrame.x = UI_CONSTANTS.SECTION_POSITION.x;
    mainFrame.y = UI_CONSTANTS.SECTION_POSITION.y;
    mainFrame.fills = [];

    // Auto layout 설정
    mainFrame.layoutMode = 'VERTICAL';
    mainFrame.itemSpacing = UI_CONSTANTS.PALETTE_SPACING;
    mainFrame.paddingTop = UI_CONSTANTS.PALETTE_SPACING;
    mainFrame.paddingBottom = UI_CONSTANTS.PALETTE_SPACING;
    mainFrame.paddingLeft = 64;
    mainFrame.paddingRight = 64;
    mainFrame.primaryAxisSizingMode = 'AUTO';
    mainFrame.counterAxisSizingMode = 'AUTO';

    // 헤더 생성
    const header = createSemanticPaletteHeader(theme, fontName);
    mainFrame.appendChild(header);

    // Primitive 컬러 섹션
    const primitiveSection = createPrimitiveColorsSection(generatedThemeData, fontName);
    mainFrame.appendChild(primitiveSection);

    // Semantic 토큰 섹션
    const semanticSection = createSemanticTokensSection(semanticTokens, fontName);
    mainFrame.appendChild(semanticSection);

    return mainFrame;
}

function createPaletteHeader(theme: string, fontName: FontName): FrameNode {
    const header = figma.createFrame();
    header.name = 'header';
    header.fills = [];
    header.layoutMode = 'VERTICAL';
    header.primaryAxisSizingMode = 'AUTO';
    header.counterAxisSizingMode = 'AUTO';
    header.paddingBottom = 16;

    const titleFrame = figma.createFrame();
    titleFrame.name = 'title';
    titleFrame.fills = [];
    titleFrame.layoutMode = 'HORIZONTAL';
    titleFrame.primaryAxisSizingMode = 'AUTO';
    titleFrame.counterAxisSizingMode = 'AUTO';

    const titleText = figma.createText();
    titleText.fontName = fontName;
    titleText.name = 'title';
    titleText.characters = `Generated ${formatFamilyTitle(theme)} Colors`;
    titleText.fontSize = 38;

    titleFrame.appendChild(titleText);
    header.appendChild(titleFrame);

    return header;
}

function createSemanticPaletteHeader(theme: string, fontName: FontName): FrameNode {
    const header = figma.createFrame();
    header.name = 'header';
    header.fills = [];
    header.layoutMode = 'VERTICAL';
    header.primaryAxisSizingMode = 'AUTO';
    header.counterAxisSizingMode = 'AUTO';
    header.paddingBottom = 16;

    const titleFrame = figma.createFrame();
    titleFrame.name = 'title';
    titleFrame.fills = [];
    titleFrame.layoutMode = 'HORIZONTAL';
    titleFrame.primaryAxisSizingMode = 'AUTO';
    titleFrame.counterAxisSizingMode = 'AUTO';

    const titleText = figma.createText();
    titleText.fontName = fontName;
    titleText.name = 'title';
    titleText.characters = `Generated ${formatFamilyTitle(theme)} Semantic Colors`;
    titleText.fontSize = 38;

    titleFrame.appendChild(titleText);
    header.appendChild(titleFrame);

    return header;
}

function createColorFamilySection(
    familyName: string,
    colorShades: ColorPaletteCollection['light'][string],
    isBackground: boolean,
    fontName: FontName,
): FrameNode {
    const section = figma.createFrame();
    section.name = `${familyName} section`;
    section.fills = [];
    section.layoutMode = 'VERTICAL';
    section.itemSpacing = 8;
    section.paddingBottom = 16;
    section.primaryAxisSizingMode = 'AUTO';
    section.counterAxisSizingMode = 'AUTO';

    // 패밀리 타이틀
    const familyTitle = figma.createText();
    familyTitle.fontName = fontName;
    familyTitle.name = `${familyName} title`;
    familyTitle.characters = `${formatFamilyTitle(familyName)} Colors`;
    familyTitle.fontSize = 24;
    section.appendChild(familyTitle);

    // 컬러 컨테이너
    const colorContainer = figma.createFrame();
    colorContainer.name = 'color container';
    colorContainer.fills = [];
    colorContainer.layoutMode = 'VERTICAL';
    colorContainer.itemSpacing = 0;
    colorContainer.primaryAxisSizingMode = 'AUTO';
    colorContainer.counterAxisSizingMode = 'AUTO';
    section.appendChild(colorContainer);

    if (isBackground && typeof colorShades === 'object') {
        Object.entries(colorShades).forEach(([shadeName, colorData]) => {
            if (
                colorData &&
                typeof colorData === 'object' &&
                'hex' in colorData &&
                typeof colorData.hex === 'string'
            ) {
                const colorRow = createColorRow(
                    `${familyName} ${shadeName}`,
                    colorData.hex,
                    fontName,
                    'oklch' in colorData && typeof colorData.oklch === 'string'
                        ? colorData.oklch
                        : undefined,
                    'codeSyntax' in colorData && typeof colorData.codeSyntax === 'string'
                        ? colorData.codeSyntax
                        : undefined,
                );
                colorContainer.appendChild(colorRow);
            }
        });
    } else {
        const sortedShades = sortColorShades(colorShades);
        sortedShades.forEach(([shade, colorData]) => {
            if (
                colorData &&
                typeof colorData === 'object' &&
                'hex' in colorData &&
                typeof colorData.hex === 'string'
            ) {
                const colorRow = createColorRow(
                    `${familyName} ${shade}`,
                    colorData.hex,
                    fontName,
                    'oklch' in colorData && typeof colorData.oklch === 'string'
                        ? colorData.oklch
                        : undefined,
                    'codeSyntax' in colorData && typeof colorData.codeSyntax === 'string'
                        ? colorData.codeSyntax
                        : undefined,
                );
                colorContainer.appendChild(colorRow);
            }
        });
    }

    return section;
}

function createPrimitiveColorsSection(
    generatedThemeData: ColorPaletteCollection['light'],
    fontName: FontName,
): FrameNode {
    const section = figma.createFrame();
    section.name = 'primitive colors section';
    section.fills = [];
    section.layoutMode = 'VERTICAL';
    section.itemSpacing = 16;
    section.primaryAxisSizingMode = 'AUTO';
    section.counterAxisSizingMode = 'AUTO';

    const sectionTitle = figma.createText();
    sectionTitle.fontName = fontName;
    sectionTitle.name = 'primitive colors title';
    sectionTitle.characters = 'Primitive Colors';
    sectionTitle.fontSize = 24;
    section.appendChild(sectionTitle);

    Object.entries(generatedThemeData).forEach(([colorFamily, colorShades]) => {
        if (colorFamily === 'background') {
            const bgSection = createColorFamilySection(colorFamily, colorShades, true, fontName);
            section.appendChild(bgSection);
        } else if (typeof colorShades === 'object' && colorShades !== null) {
            const colorSection = createColorFamilySection(
                colorFamily,
                colorShades,
                false,
                fontName,
            );
            section.appendChild(colorSection);
        }
    });

    return section;
}

function createSemanticTokensSection(
    semanticTokens: ThemeDependentTokensCollection['light'],
    fontName: FontName,
): FrameNode {
    const section = figma.createFrame();
    section.name = 'semantic tokens section';
    section.fills = [];
    section.layoutMode = 'VERTICAL';
    section.itemSpacing = 16;
    section.primaryAxisSizingMode = 'AUTO';
    section.counterAxisSizingMode = 'AUTO';

    const sectionTitle = figma.createText();
    sectionTitle.fontName = fontName;
    sectionTitle.name = 'semantic tokens title';
    sectionTitle.characters = 'Semantic Tokens';
    sectionTitle.fontSize = 24;
    section.appendChild(sectionTitle);

    Object.entries(semanticTokens).forEach(([colorFamily, tokenMap]) => {
        const tokenSection = createSemanticTokenFamilySection(colorFamily, tokenMap, fontName);
        section.appendChild(tokenSection);
    });

    return section;
}

function createSemanticTokenFamilySection(
    familyName: string,
    tokenMap: Record<
        string,
        { hex: string; oklch?: string; codeSyntax?: string; primitiveCodeSyntax?: string }
    >,
    fontName: FontName,
): FrameNode {
    const section = figma.createFrame();
    section.name = `${familyName} semantic tokens section`;
    section.fills = [];
    section.layoutMode = 'VERTICAL';
    section.itemSpacing = 8;
    section.paddingBottom = 16;
    section.primaryAxisSizingMode = 'AUTO';
    section.counterAxisSizingMode = 'AUTO';

    const familyTitle = figma.createText();
    familyTitle.fontName = fontName;
    familyTitle.name = `${familyName} semantic title`;
    familyTitle.characters = `${formatFamilyTitle(familyName)} Semantic Tokens`;
    familyTitle.fontSize = 20;
    section.appendChild(familyTitle);

    const colorContainer = figma.createFrame();
    colorContainer.name = 'semantic color container';
    colorContainer.fills = [];
    colorContainer.layoutMode = 'VERTICAL';
    colorContainer.itemSpacing = 0;
    colorContainer.primaryAxisSizingMode = 'AUTO';
    colorContainer.counterAxisSizingMode = 'AUTO';
    section.appendChild(colorContainer);

    Object.entries(tokenMap).forEach(([tokenName, tokenData]) => {
        if (tokenData && typeof tokenData === 'object' && tokenData.hex) {
            const semanticColorRow = createSemanticColorRow(
                tokenName,
                tokenData.hex,
                fontName,
                tokenData.oklch,
                tokenData.codeSyntax,
                tokenData.primitiveCodeSyntax,
            );
            colorContainer.appendChild(semanticColorRow);
        }
    });

    return section;
}

function createColorRow(
    colorName: string,
    hexColor: string,
    fontName: FontName,
    oklchColor?: string,
    codeSyntax?: string,
): FrameNode {
    const row = figma.createFrame();
    row.name = 'color row';
    row.fills = [];
    row.layoutMode = 'HORIZONTAL';
    row.itemSpacing = 0;
    row.primaryAxisSizingMode = 'AUTO';
    row.counterAxisSizingMode = 'FIXED';
    row.resizeWithoutConstraints(
        UI_CONSTANTS.LAYOUT_WIDTHS.STANDARD_ROW,
        UI_CONSTANTS.COLOR_ROW_HEIGHT,
    );

    // 이름 필드
    const nameField = createNameField(colorName, fontName, UI_CONSTANTS.LAYOUT_WIDTHS.NAME_FIELD);
    row.appendChild(nameField);

    // 값 필드
    const valueField = createValueField(hexColor, oklchColor, codeSyntax, fontName);
    row.appendChild(valueField);

    return row;
}

function createSemanticColorRow(
    colorName: string,
    hexColor: string,
    fontName: FontName,
    oklchColor?: string,
    _codeSyntax?: string,
    primitiveCodeSyntax?: string,
): FrameNode {
    const row = figma.createFrame();
    row.name = 'semantic color row';
    row.fills = [];
    row.layoutMode = 'HORIZONTAL';
    row.itemSpacing = 0;
    row.primaryAxisSizingMode = 'AUTO';
    row.counterAxisSizingMode = 'FIXED';
    row.resizeWithoutConstraints(
        UI_CONSTANTS.LAYOUT_WIDTHS.SEMANTIC_ROW,
        UI_CONSTANTS.COLOR_ROW_HEIGHT,
    );

    // 이름 필드
    const nameField = createNameField(
        colorName,
        fontName,
        UI_CONSTANTS.LAYOUT_WIDTHS.SEMANTIC_NAME_FIELD,
    );
    row.appendChild(nameField);

    // 토큰 필드
    const tokenField = createTokenField(primitiveCodeSyntax || 'N/A', fontName);
    row.appendChild(tokenField);

    // 값 필드
    const valueField = createValueField(hexColor, oklchColor, undefined, fontName);
    row.appendChild(valueField);

    return row;
}

function createNameField(name: string, fontName: FontName, width: number): FrameNode {
    const nameField = figma.createFrame();
    nameField.name = 'name';
    nameField.fills = [];
    nameField.layoutMode = 'HORIZONTAL';
    nameField.itemSpacing = 0;
    nameField.paddingTop = 18;
    nameField.paddingBottom = 18;
    nameField.paddingLeft = 16;
    nameField.paddingRight = 16;
    nameField.primaryAxisAlignItems = 'CENTER';
    nameField.primaryAxisSizingMode = 'FIXED';
    nameField.counterAxisSizingMode = 'FIXED';
    nameField.resizeWithoutConstraints(width, UI_CONSTANTS.COLOR_ROW_HEIGHT);

    const nameText = figma.createText();
    nameText.fontName = fontName;
    nameText.name = 'name text';
    nameText.characters = formatColorName(name);
    nameText.fontSize = 14;
    nameField.appendChild(nameText);

    return nameField;
}

function createTokenField(tokenRef: string, fontName: FontName): FrameNode {
    const tokenField = figma.createFrame();
    tokenField.name = 'token';
    tokenField.fills = [];
    tokenField.layoutMode = 'HORIZONTAL';
    tokenField.itemSpacing = 0;
    tokenField.paddingTop = 18;
    tokenField.paddingBottom = 18;
    tokenField.paddingLeft = 16;
    tokenField.paddingRight = 16;
    tokenField.primaryAxisAlignItems = 'CENTER';
    tokenField.primaryAxisSizingMode = 'FIXED';
    tokenField.counterAxisSizingMode = 'FIXED';
    tokenField.resizeWithoutConstraints(
        UI_CONSTANTS.LAYOUT_WIDTHS.SEMANTIC_TOKEN_FIELD,
        UI_CONSTANTS.COLOR_ROW_HEIGHT,
    );

    const tokenText = figma.createText();
    tokenText.fontName = fontName;
    tokenText.name = 'token reference text';
    tokenText.characters = tokenRef;
    tokenText.fontSize = 12;
    tokenText.fills = [{ type: 'SOLID', color: { r: 0.3, g: 0.3, b: 0.7 } }];
    tokenField.appendChild(tokenText);

    return tokenField;
}

function createValueField(
    hexColor: string,
    oklchColor?: string,
    codeSyntax?: string,
    fontName?: FontName,
): FrameNode {
    const valueField = figma.createFrame();
    valueField.name = 'value';
    valueField.fills = [];
    valueField.layoutMode = 'HORIZONTAL';
    valueField.itemSpacing = 12;
    valueField.paddingTop = 12;
    valueField.paddingBottom = 12;
    valueField.paddingRight = 16;
    valueField.primaryAxisAlignItems = 'CENTER';
    valueField.primaryAxisSizingMode = 'AUTO';
    valueField.counterAxisSizingMode = 'FIXED';

    // 컬러 스와치
    const colorRect = figma.createRectangle();
    colorRect.name = 'color shape';
    colorRect.resizeWithoutConstraints(
        UI_CONSTANTS.COLOR_SWATCH_SIZE,
        UI_CONSTANTS.COLOR_SWATCH_SIZE,
    );
    colorRect.fills = [{ type: 'SOLID', color: hexToFigmaColor(hexColor) }];
    valueField.appendChild(colorRect);

    // 컬러 값들
    if (fontName) {
        const colorValuesContainer = figma.createFrame();
        colorValuesContainer.name = 'color values';
        colorValuesContainer.fills = [];
        colorValuesContainer.layoutMode = 'VERTICAL';
        colorValuesContainer.itemSpacing = 2;
        colorValuesContainer.primaryAxisSizingMode = 'AUTO';
        colorValuesContainer.counterAxisSizingMode = 'AUTO';
        colorValuesContainer.primaryAxisAlignItems = 'MIN';

        // HEX 값
        const hexText = figma.createText();
        hexText.fontName = fontName;
        hexText.name = 'hex value';
        hexText.characters = hexColor.toUpperCase();
        hexText.fontSize = 12;
        colorValuesContainer.appendChild(hexText);

        // OKLCH 값
        if (oklchColor) {
            const oklchText = figma.createText();
            oklchText.fontName = fontName;
            oklchText.name = 'oklch value';
            oklchText.characters = oklchColor;
            oklchText.fontSize = 10;
            oklchText.fills = [{ type: 'SOLID', color: { r: 0.5, g: 0.5, b: 0.5 } }];
            colorValuesContainer.appendChild(oklchText);
        }

        // Code Syntax
        if (codeSyntax) {
            const codeSyntaxText = figma.createText();
            codeSyntaxText.fontName = fontName;
            codeSyntaxText.name = 'code syntax value';
            codeSyntaxText.characters = codeSyntax;
            codeSyntaxText.fontSize = 10;
            codeSyntaxText.fills = [{ type: 'SOLID', color: { r: 0.4, g: 0.4, b: 0.4 } }];
            colorValuesContainer.appendChild(codeSyntaxText);
        }

        valueField.appendChild(colorValuesContainer);
    }

    return valueField;
}
