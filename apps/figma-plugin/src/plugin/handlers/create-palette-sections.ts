import type { ColorPaletteCollection } from '@vapor-ui/color-generator';

// ============================================================================
// Palette Creation Logic
// ============================================================================

/**
 * Handles the end-to-end process of creating palette sections.
 * It loads the necessary font and then creates the visual sections in Figma.
 */
export async function handleCreatePaletteSections(
    generatedPalette: Pick<ColorPaletteCollection, 'light' | 'dark'>,
): Promise<void> {
    try {
        console.log('Creating palette sections:', { generatedPalette });

        const fontName = await loadDefaultFont();

        createPaletteSections(generatedPalette, fontName);

        figma.notify('새로운 팔레트 섹션이 생성되었습니다! 🎨');
    } catch (error) {
        console.error('Error creating palette sections:', error);
        figma.notify('팔레트 섹션 생성 중 오류가 발생했습니다 ❌');
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

function createPaletteSections(
    generatedPalette: Pick<ColorPaletteCollection, 'light' | 'dark'>,
    fontName: FontName,
): void {
    const currentPage = figma.currentPage;

    console.log('Generated palette:', generatedPalette);

    // Create light theme section
    if (generatedPalette.light) {
        console.log('Creating light section');
        const lightSection = createThemeSection('light', generatedPalette.light, fontName);
        currentPage.appendChild(lightSection);
    }

    // Create dark theme section
    if (generatedPalette.dark) {
        console.log('Creating dark section');
        const darkSection = createThemeSection('dark', generatedPalette.dark, fontName);
        currentPage.appendChild(darkSection);
    }
}

function createThemeSection(
    theme: 'light' | 'dark',
    themeData: ColorPaletteCollection['light'],
    fontName: FontName,
): SectionNode {
    // Create section
    const section = figma.createSection();
    section.name = `${theme} (Generated)`;

    // Position sections side by side
    const offset = theme === 'light' ? 0 : 2000;
    section.x = 100 + offset;
    section.y = 100;

    console.log(`Creating ${theme} section with generated colors:`, Object.keys(themeData));

    // Create palette table with generated color data
    const paletteTable = createPaletteTable(themeData, theme, fontName);
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

function createPaletteTable(
    generatedThemeData: ColorPaletteCollection['light'],
    theme: string,
    fontName: FontName,
): FrameNode {
    // Create main frame with auto layout
    const newMainFrame = figma.createFrame();
    newMainFrame.name = 'Generated Palette';
    newMainFrame.x = 100;
    newMainFrame.y = 100;
    newMainFrame.fills = [];

    // Set auto layout for main frame - this will size to content
    newMainFrame.layoutMode = 'VERTICAL';
    newMainFrame.itemSpacing = 32; // Space between color family sections
    newMainFrame.paddingTop = 32;
    newMainFrame.paddingBottom = 32;
    newMainFrame.paddingLeft = 64;
    newMainFrame.paddingRight = 64;
    newMainFrame.primaryAxisSizingMode = 'AUTO'; // Auto height
    newMainFrame.counterAxisSizingMode = 'AUTO'; // Auto width

    // Create header section
    const header = createPaletteHeader(theme, fontName);
    newMainFrame.appendChild(header);

    // Process each color family from generated data (auto layout handles positioning)
    Object.entries(generatedThemeData).forEach(([colorFamily, colorShades]) => {
        if (colorFamily === 'background') {
            // Handle background colors specially
            const bgSection = createColorFamilySection(colorFamily, colorShades, true, fontName);
            newMainFrame.appendChild(bgSection);
        } else if (typeof colorShades === 'object' && colorShades !== null) {
            // Regular color family (red, blue, green, etc.)
            const colorSection = createColorFamilySection(
                colorFamily,
                colorShades,
                false,
                fontName,
            );
            newMainFrame.appendChild(colorSection);
        }
    });

    return newMainFrame;
}

function createPaletteHeader(theme: string, fontName: FontName): FrameNode {
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
    titleText.characters = `Generated ${theme.charAt(0).toUpperCase() + theme.slice(1)} Colors`;
    titleText.x = 0;
    titleText.y = 0;
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

    // Set auto layout for section - this will size to content
    section.layoutMode = 'VERTICAL';
    section.itemSpacing = 8; // Space between title and colors, and between color rows
    section.paddingTop = 0;
    section.paddingBottom = 16;
    section.paddingLeft = 0;
    section.paddingRight = 0;
    section.primaryAxisSizingMode = 'AUTO'; // Auto height
    section.counterAxisSizingMode = 'AUTO'; // Auto width

    // Create family title
    const familyTitle = figma.createText();
    // Apply the loaded font
    familyTitle.fontName = fontName;
    familyTitle.name = `${familyName} title`;
    familyTitle.characters = `${formatFamilyTitle(familyName)} Colors`;
    familyTitle.fontSize = 24;

    section.appendChild(familyTitle);

    // Create color container with auto layout
    const colorContainer = figma.createFrame();
    colorContainer.name = 'color container';
    colorContainer.fills = [];
    colorContainer.layoutMode = 'VERTICAL';
    colorContainer.itemSpacing = 0; // No space between color rows
    colorContainer.primaryAxisSizingMode = 'AUTO'; // Auto height
    colorContainer.counterAxisSizingMode = 'AUTO'; // Auto width

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
        // Sort shades to ensure 050 appears first
        const sortedShades = Object.entries(colorShades).sort(([a], [b]) => {
            // Convert to numbers for proper sorting (050 -> 50, 100 -> 100, etc.)
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

    // Set auto layout for name field
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
    // Apply the loaded font
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

    // Set auto layout for value field
    valueField.layoutMode = 'HORIZONTAL';
    valueField.itemSpacing = 12; // Space between color swatch and text
    valueField.paddingTop = 12;
    valueField.paddingBottom = 12;
    valueField.paddingLeft = 0;
    valueField.paddingRight = 16;
    valueField.primaryAxisAlignItems = 'CENTER'; // Vertical center
    valueField.primaryAxisSizingMode = 'AUTO'; // Auto width to accommodate both hex and oklch
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
    colorValuesContainer.itemSpacing = 2; // Small space between hex and oklch
    colorValuesContainer.primaryAxisSizingMode = 'AUTO';
    colorValuesContainer.counterAxisSizingMode = 'AUTO';
    colorValuesContainer.primaryAxisAlignItems = 'MIN'; // Left align

    // Hex value text
    const hexText = figma.createText();
    // Apply the loaded font
    hexText.fontName = fontName;
    hexText.name = 'hex value';
    hexText.characters = hexColor.toUpperCase();
    hexText.fontSize = 12;
    colorValuesContainer.appendChild(hexText);

    // OKLCH value text (if available)
    if (oklchColor) {
        const oklchText = figma.createText();
        // Apply the loaded font
        oklchText.fontName = fontName;
        oklchText.name = 'oklch value';
        oklchText.characters = oklchColor;
        oklchText.fontSize = 10;
        // Make OKLCH text slightly lighter/gray
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
        // Apply the loaded font
        codeSyntaxText.fontName = fontName;
        codeSyntaxText.name = 'code syntax value';
        codeSyntaxText.characters = codeSyntax;
        codeSyntaxText.fontSize = 10;
        // Make code syntax text slightly lighter/gray
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
