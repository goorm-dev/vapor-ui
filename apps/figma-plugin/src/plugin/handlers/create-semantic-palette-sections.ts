import type { ColorPaletteCollection, ThemeDependentTokensCollection } from '@vapor-ui/color-generator';

// ============================================================================
// Semantic Palette Creation Logic
// ============================================================================

/**
 * Handles the end-to-end process of creating semantic palette sections.
 * It loads the necessary font and then creates the visual sections in Figma.
 */
export async function handleCreateSemanticPaletteSections(
    generatedSemanticPalette: Pick<ColorPaletteCollection, 'light' | 'dark'>,
    dependentTokens: ThemeDependentTokensCollection,
): Promise<void> {
    try {
        console.log('Creating semantic palette sections:', { generatedSemanticPalette, dependentTokens });

        const fontName = await loadDefaultFont();

        createSemanticPaletteSections(generatedSemanticPalette, dependentTokens, fontName);

        figma.notify('새로운 시맨틱 팔레트 섹션이 생성되었습니다! 🎨');
    } catch (error) {
        console.error('Error creating semantic palette sections:', error);
        figma.notify('시맨틱 팔레트 섹션 생성 중 오류가 발생했습니다 ❌');
    }
}

// ============================================================================
// Font Loading
// ============================================================================

/**
 * Loads the default font for the plugin.
 * It first tries to load "Pretendard". If it fails, it logs a warning
 * and falls back to "Inter". If "Inter" also fails, it throws an error.
 * @returns {Promise<FontName>} The font name that was successfully loaded.
 */
async function loadDefaultFont(): Promise<FontName> {
    const defaultFontFamily = 'Pretendard';
    const defaultFount: FontName = { family: defaultFontFamily, style: 'Regular' };
    const interFont: FontName = { family: 'Inter', style: 'Regular' };

    try {
        await figma.loadFontAsync(defaultFount);
        console.log(`Successfully loaded default "${defaultFontFamily}" font.`);
        return defaultFount;
    } catch (error) {
        console.warn(`Could not load "${defaultFontFamily}" font. Falling back to "Inter".`, error);
        try {
            await figma.loadFontAsync(interFont);
            console.log('Successfully loaded fallback "Inter" font.');
            return interFont;
        } catch (fallbackError) {
            console.error('Critical: Could not load fallback "Inter" font.', fallbackError);
            throw new Error('Default fonts could not be loaded.');
        }
    }
}

// ============================================================================
// Palette Creation Functions
// ============================================================================

function createSemanticPaletteSections(
    generatedSemanticPalette: Pick<ColorPaletteCollection, 'light' | 'dark'>,
    dependentTokens: ThemeDependentTokensCollection,
    fontName: FontName,
): void {
    const currentPage = figma.currentPage;

    console.log('Generated semantic palette:', generatedSemanticPalette);
    console.log('Dependent tokens:', dependentTokens);

    // Create light theme section with both primitive and semantic tokens
    if (generatedSemanticPalette.light && dependentTokens.light) {
        console.log('Creating light semantic section');
        const lightSection = createSemanticThemeSection(
            'light', 
            generatedSemanticPalette.light, 
            dependentTokens.light,
            fontName
        );
        currentPage.appendChild(lightSection);
    }

    // Create dark theme section with both primitive and semantic tokens
    if (generatedSemanticPalette.dark && dependentTokens.dark) {
        console.log('Creating dark semantic section');
        const darkSection = createSemanticThemeSection(
            'dark', 
            generatedSemanticPalette.dark, 
            dependentTokens.dark,
            fontName
        );
        currentPage.appendChild(darkSection);
    }
}

function createSemanticThemeSection(
    theme: 'light' | 'dark',
    themeData: ColorPaletteCollection['light'],
    semanticTokens: ThemeDependentTokensCollection['light'],
    fontName: FontName,
): SectionNode {
    // Create section
    const section = figma.createSection();
    section.name = `${theme} Semantic (Generated)`;

    // Position sections side by side
    const offset = theme === 'light' ? 0 : 2000;
    section.x = 100 + offset;
    section.y = 100;

    console.log(`Creating ${theme} semantic section with generated colors:`, Object.keys(themeData));
    console.log(`Semantic tokens:`, semanticTokens);

    // Create palette table with both primitive and semantic token data
    const paletteTable = createSemanticPaletteTable(themeData, semanticTokens, theme, fontName);
    if (paletteTable) {
        section.appendChild(paletteTable);

        // Resize section to fit the palette table with some padding
        const padding = 100;
        section.resizeWithoutConstraints(
            paletteTable.width + padding,
            paletteTable.height + padding,
        );
    } else {
        // Fallback size if no palette table
        section.resizeWithoutConstraints(1500, 500);
    }

    return section;
}

function createSemanticPaletteTable(
    generatedThemeData: ColorPaletteCollection['light'],
    semanticTokens: ThemeDependentTokensCollection['light'],
    theme: string,
    fontName: FontName,
): FrameNode {
    // Create main frame with auto layout
    const newMainFrame = figma.createFrame();
    newMainFrame.name = 'Generated Semantic Palette';
    newMainFrame.x = 100;
    newMainFrame.y = 100;
    newMainFrame.fills = [];

    // Set auto layout for main frame - this will size to content
    newMainFrame.layoutMode = 'VERTICAL';
    newMainFrame.itemSpacing = 32; // Space between sections
    newMainFrame.paddingTop = 32;
    newMainFrame.paddingBottom = 32;
    newMainFrame.paddingLeft = 64;
    newMainFrame.paddingRight = 64;
    newMainFrame.primaryAxisSizingMode = 'AUTO'; // Auto height
    newMainFrame.counterAxisSizingMode = 'AUTO'; // Auto width

    // Create header section
    const header = createSemanticPaletteHeader(theme, fontName);
    newMainFrame.appendChild(header);

    // Create primitive colors section
    const primitiveSection = createPrimitiveColorsSection(generatedThemeData, fontName);
    newMainFrame.appendChild(primitiveSection);

    // Create semantic tokens section
    const semanticSection = createSemanticTokensSection(semanticTokens, fontName);
    newMainFrame.appendChild(semanticSection);

    return newMainFrame;
}

function createSemanticPaletteHeader(theme: string, fontName: FontName): FrameNode {
    const header = figma.createFrame();
    header.name = 'header';
    header.x = 0;
    header.y = 0;
    header.fills = [];
    header.layoutMode = 'VERTICAL';
    header.primaryAxisSizingMode = 'AUTO'; // Auto height
    header.counterAxisSizingMode = 'AUTO'; // Auto width
    header.paddingTop = 0;
    header.paddingBottom = 16;

    const titleFrame = figma.createFrame();
    titleFrame.name = 'title';
    titleFrame.fills = [];
    titleFrame.layoutMode = 'HORIZONTAL';
    titleFrame.primaryAxisSizingMode = 'AUTO'; // Auto width
    titleFrame.counterAxisSizingMode = 'AUTO'; // Auto height

    const titleText = figma.createText();
    // Apply the loaded font
    titleText.fontName = fontName;
    titleText.name = 'title';
    titleText.characters = `Generated ${theme.charAt(0).toUpperCase() + theme.slice(1)} Semantic Colors`;
    titleText.x = 0;
    titleText.y = 0;
    titleText.fontSize = 38;

    titleFrame.appendChild(titleText);
    header.appendChild(titleFrame);

    return header;
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

    // Section title
    const sectionTitle = figma.createText();
    sectionTitle.fontName = fontName;
    sectionTitle.name = 'primitive colors title';
    sectionTitle.characters = 'Primitive Colors';
    sectionTitle.fontSize = 24;
    section.appendChild(sectionTitle);

    // Process each color family from generated data
    Object.entries(generatedThemeData).forEach(([colorFamily, colorShades]) => {
        if (colorFamily === 'background') {
            // Handle background colors specially
            const bgSection = createColorFamilySection(colorFamily, colorShades, true, fontName);
            section.appendChild(bgSection);
        } else if (typeof colorShades === 'object' && colorShades !== null) {
            // Regular color family (primary, etc.)
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

    // Section title
    const sectionTitle = figma.createText();
    sectionTitle.fontName = fontName;
    sectionTitle.name = 'semantic tokens title';
    sectionTitle.characters = 'Semantic Tokens';
    sectionTitle.fontSize = 24;
    section.appendChild(sectionTitle);

    // Process semantic tokens
    Object.entries(semanticTokens).forEach(([colorFamily, tokenMap]) => {
        const tokenSection = createSemanticTokenFamilySection(colorFamily, tokenMap, fontName);
        section.appendChild(tokenSection);
    });

    return section;
}

function createSemanticTokenFamilySection(
    familyName: string,
    tokenMap: Record<string, { hex: string; oklch?: string; codeSyntax?: string; primitiveCodeSyntax?: string }>,
    fontName: FontName,
): FrameNode {
    const section = figma.createFrame();
    section.name = `${familyName} semantic tokens section`;
    section.fills = [];
    section.layoutMode = 'VERTICAL';
    section.itemSpacing = 8;
    section.paddingTop = 0;
    section.paddingBottom = 16;
    section.paddingLeft = 0;
    section.paddingRight = 0;
    section.primaryAxisSizingMode = 'AUTO';
    section.counterAxisSizingMode = 'AUTO';

    // Create family title
    const familyTitle = figma.createText();
    familyTitle.fontName = fontName;
    familyTitle.name = `${familyName} semantic title`;
    familyTitle.characters = `${formatFamilyTitle(familyName)} Semantic Tokens`;
    familyTitle.fontSize = 20;
    section.appendChild(familyTitle);

    // Create color container with auto layout
    const colorContainer = figma.createFrame();
    colorContainer.name = 'semantic color container';
    colorContainer.fills = [];
    colorContainer.layoutMode = 'VERTICAL';
    colorContainer.itemSpacing = 0;
    colorContainer.primaryAxisSizingMode = 'AUTO';
    colorContainer.counterAxisSizingMode = 'AUTO';
    section.appendChild(colorContainer);

    // Process semantic tokens - these have name, token (primitiveCodeSyntax), and value
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
    section.paddingTop = 0;
    section.paddingBottom = 16;
    section.paddingLeft = 0;
    section.paddingRight = 0;
    section.primaryAxisSizingMode = 'AUTO';
    section.counterAxisSizingMode = 'AUTO';

    // Create family title
    const familyTitle = figma.createText();
    familyTitle.fontName = fontName;
    familyTitle.name = `${familyName} title`;
    familyTitle.characters = `${formatFamilyTitle(familyName)} Colors`;
    familyTitle.fontSize = 20;
    section.appendChild(familyTitle);

    // Create color container with auto layout
    const colorContainer = figma.createFrame();
    colorContainer.name = 'color container';
    colorContainer.fills = [];
    colorContainer.layoutMode = 'VERTICAL';
    colorContainer.itemSpacing = 0;
    colorContainer.primaryAxisSizingMode = 'AUTO';
    colorContainer.counterAxisSizingMode = 'AUTO';
    section.appendChild(colorContainer);

    if (isBackground && typeof colorShades === 'object') {
        // Handle background colors
        Object.entries(colorShades).forEach(([shadeName, colorData]) => {
            if (colorData && typeof colorData === 'object' && colorData.hex) {
                const colorRow = createColorRow(
                    `${familyName} ${shadeName}`,
                    colorData.hex,
                    fontName,
                    colorData.oklch,
                    colorData.codeSyntax,
                );
                colorContainer.appendChild(colorRow);
            }
        });
    } else {
        // Handle regular color families with shades (050, 100, 200, etc.)
        const sortedShades = Object.entries(colorShades).sort(([a], [b]) => {
            const numA = parseInt(a, 10);
            const numB = parseInt(b, 10);
            return numA - numB;
        });

        sortedShades.forEach(([shade, colorData]) => {
            if (colorData && typeof colorData === 'object' && colorData.hex) {
                const colorRow = createColorRow(
                    `${familyName} ${shade}`,
                    colorData.hex,
                    fontName,
                    colorData.oklch,
                    colorData.codeSyntax,
                );
                colorContainer.appendChild(colorRow);
            }
        });
    }

    return section;
}

function formatColorName(colorName: string): string {
    // Convert shade numbers like '050' to more readable format like '50'
    return colorName.replace(/\b0(\d+)\b/g, '$1');
}

function formatFamilyTitle(familyName: string): string {
    // Capitalize first letter and improve readability
    return familyName.charAt(0).toUpperCase() + familyName.slice(1);
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

    // Set auto layout for row (horizontal)
    row.layoutMode = 'HORIZONTAL';
    row.itemSpacing = 0;
    row.paddingTop = 0;
    row.paddingBottom = 0;
    row.paddingLeft = 0;
    row.paddingRight = 0;
    row.primaryAxisSizingMode = 'AUTO'; // Auto width
    row.counterAxisSizingMode = 'FIXED'; // Fixed height
    row.resizeWithoutConstraints(1200, 56); // Set fixed height for rows

    // Name field
    const nameField = figma.createFrame();
    nameField.name = 'name';
    nameField.fills = [];
    nameField.layoutMode = 'HORIZONTAL';
    nameField.itemSpacing = 0;
    nameField.paddingTop = 18;
    nameField.paddingBottom = 18;
    nameField.paddingLeft = 16;
    nameField.paddingRight = 16;
    nameField.primaryAxisAlignItems = 'CENTER'; // Vertical center
    nameField.primaryAxisSizingMode = 'FIXED'; // Fixed width
    nameField.counterAxisSizingMode = 'FIXED'; // Fixed height
    nameField.resizeWithoutConstraints(592, 56);

    const nameText = figma.createText();
    nameText.fontName = fontName;
    nameText.name = 'name text';
    nameText.characters = formatColorName(colorName);
    nameText.fontSize = 14;
    nameField.appendChild(nameText);
    row.appendChild(nameField);

    // Value field with main color swatch and color values
    const valueField = figma.createFrame();
    valueField.name = 'value';
    valueField.fills = [];
    valueField.layoutMode = 'HORIZONTAL';
    valueField.itemSpacing = 12; // Space between color swatch and text
    valueField.paddingTop = 12;
    valueField.paddingBottom = 12;
    valueField.paddingLeft = 0;
    valueField.paddingRight = 16;
    valueField.primaryAxisAlignItems = 'CENTER'; // Vertical center
    valueField.primaryAxisSizingMode = 'AUTO'; // Auto width
    valueField.counterAxisSizingMode = 'FIXED'; // Fixed height

    // Main color swatch (32x32)
    const mainColorRect = figma.createRectangle();
    mainColorRect.name = 'color shape';
    mainColorRect.resizeWithoutConstraints(32, 32);

    const { r, g, b } = hexToRgb(hexColor);
    mainColorRect.fills = [
        {
            type: 'SOLID',
            color: { r: r / 255, g: g / 255, b: b / 255 },
        },
    ];
    valueField.appendChild(mainColorRect);

    // Color values container
    const colorValuesContainer = figma.createFrame();
    colorValuesContainer.name = 'color values';
    colorValuesContainer.fills = [];
    colorValuesContainer.layoutMode = 'VERTICAL';
    colorValuesContainer.itemSpacing = 2;
    colorValuesContainer.primaryAxisSizingMode = 'AUTO';
    colorValuesContainer.counterAxisSizingMode = 'AUTO';
    colorValuesContainer.primaryAxisAlignItems = 'MIN'; // Left align

    // Hex value text
    const hexText = figma.createText();
    hexText.fontName = fontName;
    hexText.name = 'hex value';
    hexText.characters = hexColor.toUpperCase();
    hexText.fontSize = 12;
    colorValuesContainer.appendChild(hexText);

    // OKLCH value text (if available)
    if (oklchColor) {
        const oklchText = figma.createText();
        oklchText.fontName = fontName;
        oklchText.name = 'oklch value';
        oklchText.characters = oklchColor;
        oklchText.fontSize = 10;
        oklchText.fills = [
            {
                type: 'SOLID',
                color: { r: 0.5, g: 0.5, b: 0.5 },
            },
        ];
        colorValuesContainer.appendChild(oklchText);
    }

    // Code syntax text (if available)
    if (codeSyntax) {
        const codeSyntaxText = figma.createText();
        codeSyntaxText.fontName = fontName;
        codeSyntaxText.name = 'code syntax value';
        codeSyntaxText.characters = codeSyntax;
        codeSyntaxText.fontSize = 10;
        codeSyntaxText.fills = [
            {
                type: 'SOLID',
                color: { r: 0.4, g: 0.4, b: 0.4 },
            },
        ];
        colorValuesContainer.appendChild(codeSyntaxText);
    }

    valueField.appendChild(colorValuesContainer);
    row.appendChild(valueField);

    return row;
}

// New function for semantic tokens that shows name, token reference, and value
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

    // Set auto layout for row (horizontal)
    row.layoutMode = 'HORIZONTAL';
    row.itemSpacing = 0;
    row.paddingTop = 0;
    row.paddingBottom = 0;
    row.paddingLeft = 0;
    row.paddingRight = 0;
    row.primaryAxisSizingMode = 'AUTO'; // Auto width
    row.counterAxisSizingMode = 'FIXED'; // Fixed height
    row.resizeWithoutConstraints(1400, 56); // Wider for 3 columns

    // Name field (semantic token name)
    const nameField = figma.createFrame();
    nameField.name = 'name';
    nameField.fills = [];
    nameField.layoutMode = 'HORIZONTAL';
    nameField.itemSpacing = 0;
    nameField.paddingTop = 18;
    nameField.paddingBottom = 18;
    nameField.paddingLeft = 16;
    nameField.paddingRight = 16;
    nameField.primaryAxisAlignItems = 'CENTER'; // Vertical center
    nameField.primaryAxisSizingMode = 'FIXED'; // Fixed width
    nameField.counterAxisSizingMode = 'FIXED'; // Fixed height
    nameField.resizeWithoutConstraints(400, 56);

    const nameText = figma.createText();
    nameText.fontName = fontName;
    nameText.name = 'semantic name text';
    nameText.characters = formatColorName(colorName);
    nameText.fontSize = 14;
    nameField.appendChild(nameText);
    row.appendChild(nameField);

    // Token field (shows primitive token reference)
    const tokenField = figma.createFrame();
    tokenField.name = 'token';
    tokenField.fills = [];
    tokenField.layoutMode = 'HORIZONTAL';
    tokenField.itemSpacing = 0;
    tokenField.paddingTop = 18;
    tokenField.paddingBottom = 18;
    tokenField.paddingLeft = 16;
    tokenField.paddingRight = 16;
    tokenField.primaryAxisAlignItems = 'CENTER'; // Vertical center
    tokenField.primaryAxisSizingMode = 'FIXED'; // Fixed width
    tokenField.counterAxisSizingMode = 'FIXED'; // Fixed height
    tokenField.resizeWithoutConstraints(400, 56);

    const tokenText = figma.createText();
    tokenText.fontName = fontName;
    tokenText.name = 'token reference text';
    tokenText.characters = primitiveCodeSyntax || 'N/A';
    tokenText.fontSize = 12;
    tokenText.fills = [
        {
            type: 'SOLID',
            color: { r: 0.3, g: 0.3, b: 0.7 }, // Blue-ish to indicate it's a reference
        },
    ];
    tokenField.appendChild(tokenText);
    row.appendChild(tokenField);

    // Value field with color swatch and values
    const valueField = figma.createFrame();
    valueField.name = 'value';
    valueField.fills = [];
    valueField.layoutMode = 'HORIZONTAL';
    valueField.itemSpacing = 12;
    valueField.paddingTop = 12;
    valueField.paddingBottom = 12;
    valueField.paddingLeft = 0;
    valueField.paddingRight = 16;
    valueField.primaryAxisAlignItems = 'CENTER'; // Vertical center
    valueField.primaryAxisSizingMode = 'AUTO'; // Auto width
    valueField.counterAxisSizingMode = 'FIXED'; // Fixed height

    // Color swatch (32x32)
    const colorRect = figma.createRectangle();
    colorRect.name = 'color shape';
    colorRect.resizeWithoutConstraints(32, 32);

    const { r, g, b } = hexToRgb(hexColor);
    colorRect.fills = [
        {
            type: 'SOLID',
            color: { r: r / 255, g: g / 255, b: b / 255 },
        },
    ];
    valueField.appendChild(colorRect);

    // Color values container
    const colorValuesContainer = figma.createFrame();
    colorValuesContainer.name = 'color values';
    colorValuesContainer.fills = [];
    colorValuesContainer.layoutMode = 'VERTICAL';
    colorValuesContainer.itemSpacing = 2;
    colorValuesContainer.primaryAxisSizingMode = 'AUTO';
    colorValuesContainer.counterAxisSizingMode = 'AUTO';
    colorValuesContainer.primaryAxisAlignItems = 'MIN'; // Left align

    // Hex value text
    const hexText = figma.createText();
    hexText.fontName = fontName;
    hexText.name = 'hex value';
    hexText.characters = hexColor.toUpperCase();
    hexText.fontSize = 12;
    colorValuesContainer.appendChild(hexText);

    // OKLCH value text (if available)
    if (oklchColor) {
        const oklchText = figma.createText();
        oklchText.fontName = fontName;
        oklchText.name = 'oklch value';
        oklchText.characters = oklchColor;
        oklchText.fontSize = 10;
        oklchText.fills = [
            {
                type: 'SOLID',
                color: { r: 0.5, g: 0.5, b: 0.5 },
            },
        ];
        colorValuesContainer.appendChild(oklchText);
    }

    valueField.appendChild(colorValuesContainer);
    row.appendChild(valueField);

    return row;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16),
          }
        : { r: 0, g: 0, b: 0 };
}