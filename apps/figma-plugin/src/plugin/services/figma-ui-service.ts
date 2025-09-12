import type { ColorToken } from '@vapor-ui/color-generator';

import { Logger } from '~/common/logger';
import { formatColorName, formatFamilyTitle } from '~/plugin/utils/color';
import { hexToFigmaColor } from '~/plugin/utils/color';
import { loadDefaultFont } from '~/plugin/utils/figma-font';

// ============================================================================
// Constants & Types
// ============================================================================
interface PaletteConfig {
    title: string;
    width: number;
    chipHeight: number;
    listRowHeight: number;
    spacing: {
        section: number;
        palette: number;
        item: number;
    };
    colors: {
        background: string;
        containerBg: string;
        border: string;
        text: {
            primary: string;
            secondary: string;
        };
    };
}

interface ColorData {
    name: string;
    hex: string;
    oklch: string;
    textColor?: string;
}

interface ThemeTokens {
    [tokenName: string]: ColorToken | string;
}

interface ThemeData {
    tokens: ThemeTokens;
    metadata?: {
        theme: string;
        type: string;
    };
}

const UI_CONSTANTS: PaletteConfig = {
    title: 'Color Palette',
    width: 1200,
    chipHeight: 100,
    listRowHeight: 64,
    spacing: {
        section: 40,
        palette: 24,
        item: 16,
    },
    colors: {
        background: '#F8F9FA',
        containerBg: '#FFFFFF',
        border: '#E1E1E8',
        text: {
            primary: '#2B2D36',
            secondary: '#6C6E7E',
        },
    },
} as const;

// ============================================================================
// Font Loading
// ============================================================================
async function loadRequiredFonts(): Promise<void> {
    const requiredFonts = [
        { family: 'Inter', style: 'Bold' },
        { family: 'Inter', style: 'Medium' },
        { family: 'Inter', style: 'Regular' },
    ];

    // 기본 폰트 로드 시도 (Pretendard 또는 Inter Regular)
    try {
        await loadDefaultFont();
    } catch (error) {
        Logger.error('Default font loading failed, continuing with Inter', error);
    }

    // 필요한 Inter 폰트 스타일들 로드
    for (const font of requiredFonts) {
        try {
            await figma.loadFontAsync(font);
            Logger.info(`Font loaded: ${font.family} ${font.style}`);
        } catch (error) {
            Logger.error(`Failed to load font: ${font.family} ${font.style}`, error);
        }
    }
}

async function setTextSafely(
    textNode: TextNode,
    text: string,
    fontSize: number,
    style: 'Regular' | 'Medium' | 'Bold',
): Promise<void> {
    try {
        // Inter 폰트 시도
        const interFont = { family: 'Inter', style };
        textNode.fontName = interFont;
        textNode.fontSize = fontSize;
        textNode.characters = text;
    } catch (_error) {
        try {
            // Pretendard 폰트 시도
            const pretendardFont = { family: 'Pretendard', style: 'Regular' };
            textNode.fontName = pretendardFont;
            textNode.fontSize = fontSize;
            textNode.characters = text;
        } catch (fallbackError) {
            // 기본 시스템 폰트로 폴백
            Logger.error('Font loading failed, using system default', fallbackError);
            textNode.fontSize = fontSize;
            textNode.characters = text;
        }
    }
}

// ============================================================================
// Public Service
// ============================================================================
export const figmaUIService = {
    async generatePalette(themeData: ThemeData, sectionTitle: string): Promise<SectionNode> {
        try {
            Logger.info(`Starting palette generation for: ${sectionTitle}`);

            // 필요한 모든 폰트 스타일 로드
            await loadRequiredFonts();

            // 색상 패밀리별로 그룹화
            const colorFamilies = extractColorFamilies(themeData.tokens);

            // 섹션 노드 생성
            const sectionNode = figma.createSection();
            sectionNode.name = sectionTitle;
            sectionNode.fills = [{ type: 'SOLID', color: hexToFigmaColor('#F7F7FA') }];
            
            // 섹션 패딩 설정
            const sectionPadding = 100;

            // 각 색상 패밀리별로 팔레트 생성하고 배치
            let yPosition = sectionPadding; // 상단 패딩부터 시작
            const spacing = 40;
            let maxWidth = UI_CONSTANTS.width;

            for (const [familyName, colors] of Object.entries(colorFamilies)) {
                if (colors.length > 0) {
                    const sortedColors = sortColorsByShade(colors);
                    const colorSetFrame = await createColorSetFrame(
                        `${formatFamilyTitle(familyName)} / ${sectionTitle}`,
                        sortedColors,
                    );

                    // 프레임을 섹션에 추가하고 위치 설정
                    sectionNode.appendChild(colorSetFrame);
                    colorSetFrame.x = sectionPadding; // 좌측 패딩
                    colorSetFrame.y = yPosition;

                    yPosition += colorSetFrame.height + spacing;
                    maxWidth = Math.max(maxWidth, colorSetFrame.width);
                }
            }

            // SectionNode 크기 조정 - 패딩 포함
            const finalHeight = Math.max(yPosition - spacing + sectionPadding, 200 + sectionPadding * 2);
            const finalWidth = maxWidth + sectionPadding * 2; // 좌우 패딩
            sectionNode.resizeWithoutConstraints(finalWidth, finalHeight);

            // 섹션들을 겹치지 않도록 위치 설정
            const existingSections = figma.currentPage.findAll(
                (node) => node.type === 'SECTION' && node !== sectionNode,
            ) as SectionNode[];

            let sectionX = 0;
            let sectionY = 0;

            if (existingSections.length > 0) {
                // 기존 섹션들의 우측에 배치
                const rightmostSection = existingSections.reduce((rightmost, section) =>
                    section.x + section.width > rightmost.x + rightmost.width ? section : rightmost,
                );
                sectionX = rightmostSection.x + rightmostSection.width + 100;
                sectionY = rightmostSection.y;
            }

            sectionNode.x = sectionX;
            sectionNode.y = sectionY;

            // 모든 요소가 추가된 후에 페이지에 추가
            figma.currentPage.appendChild(sectionNode);
            figma.viewport.scrollAndZoomIntoView([sectionNode]);

            return sectionNode;
        } catch (error) {
            Logger.error('Failed to generate palette:', error);
            throw error;
        }
    },
} as const;

// ============================================================================
// Color Processing
// ============================================================================
function normalizeHexColor(hex: string): string {
    // #6b63ffff (8자리) -> #6b63ff (6자리)로 변환
    let normalized = hex.toLowerCase();
    if (normalized.length === 9 && normalized.startsWith('#')) {
        // 알파 채널 제거
        normalized = normalized.substring(0, 7);
    }
    return normalized;
}

function extractColorFamily(tokenName: string): string {
    // color-myBlue-500 -> myBlue, color-red-500 -> red
    const parts = tokenName.split('-');
    if (parts.length >= 3 && parts[0] === 'color') {
        // color-myBlue-500 -> myBlue, color-background-canvas -> background
        if (parts.length > 3) {
            // 여러 단어인 경우 (color-background-canvas)
            return parts.slice(1, -1).join('-');
        }
        return parts[1]; // red, blue, green, etc.
    }
    return 'misc';
}

function extractColorFamilies(tokens: ThemeTokens): Record<string, ColorData[]> {
    const colorFamilies: Record<string, ColorData[]> = {};

    Object.entries(tokens).forEach(([tokenName, tokenData]) => {
        // primitive token만 처리 (ColorToken 타입)
        if (tokenData && typeof tokenData === 'object' && 'hex' in tokenData) {
            const colorToken = tokenData as ColorToken;
            const familyName = extractColorFamily(tokenName);

            if (!colorFamilies[familyName]) {
                colorFamilies[familyName] = [];
            }

            const normalizedHex = normalizeHexColor(colorToken.hex);
            colorFamilies[familyName].push({
                name: formatColorName(tokenName),
                hex: normalizedHex,
                oklch: colorToken.oklch,
                textColor: getContrastColor(normalizedHex),
            });
        }
    });

    return colorFamilies;
}

function sortColorsByShade(colors: ColorData[]): ColorData[] {
    return colors.sort((a, b) => {
        // 색상 이름에서 숫자 추출 (예: red-050, red-100)
        const getShadeNumber = (name: string): number => {
            const match = name.match(/(\d+)$/);
            return match ? parseInt(match[1], 10) : 500; // 기본값 500
        };

        return getShadeNumber(a.name) - getShadeNumber(b.name);
    });
}

function getContrastColor(hexColor: string): string {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // YIQ 방식을 사용하여 명도 계산
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;

    return yiq >= 128 ? '#2B2D36' : '#FFFFFF';
}

// ============================================================================
// Figma UI Components
// ============================================================================
async function createColorSetFrame(title: string, colors: ColorData[]): Promise<FrameNode> {
    const colorSetFrame = figma.createFrame();
    colorSetFrame.name = 'Color Set';
    colorSetFrame.resize(UI_CONSTANTS.width, calculateColorSetHeight(colors.length));
    colorSetFrame.fills = [
        { type: 'SOLID', color: hexToFigmaColor(UI_CONSTANTS.colors.containerBg) },
    ];
    colorSetFrame.cornerRadius = 8;
    colorSetFrame.effects = [
        {
            type: 'DROP_SHADOW',
            color: { r: 0, g: 0, b: 0, a: 0.05 },
            offset: { x: 0, y: 4 },
            radius: 12,
            visible: true,
            blendMode: 'NORMAL',
        },
    ];
    colorSetFrame.strokes = [{ type: 'SOLID', color: hexToFigmaColor(UI_CONSTANTS.colors.border) }];
    colorSetFrame.strokeWeight = 1;
    colorSetFrame.layoutMode = 'VERTICAL';
    colorSetFrame.itemSpacing = UI_CONSTANTS.spacing.palette;
    colorSetFrame.paddingTop = 32;
    colorSetFrame.paddingBottom = 32;
    colorSetFrame.paddingLeft = 32;
    colorSetFrame.paddingRight = 32;

    // 섹션 제목
    const titleText = figma.createText();
    titleText.name = 'Section Title';
    await setTextSafely(titleText, title, 18, 'Bold');
    titleText.fills = [{ type: 'SOLID', color: hexToFigmaColor(UI_CONSTANTS.colors.text.primary) }];
    titleText.layoutAlign = 'STRETCH';

    // 제목 하단 보더 추가
    const titleBorder = figma.createFrame();
    titleBorder.name = 'Title Border';
    titleBorder.resize(UI_CONSTANTS.width - 64, 1);
    titleBorder.fills = [{ type: 'SOLID', color: hexToFigmaColor(UI_CONSTANTS.colors.border) }];

    colorSetFrame.appendChild(titleText);
    colorSetFrame.appendChild(titleBorder);

    // 부모에 추가된 후에 sizing 설정
    titleBorder.layoutSizingHorizontal = 'FILL';

    // 팔레트 컨테이너
    const paletteContainer = await createPaletteContainer(colors);
    colorSetFrame.appendChild(paletteContainer);
    paletteContainer.layoutSizingHorizontal = 'FILL';

    // 리스트 뷰
    const listView = await createListView(colors);
    colorSetFrame.appendChild(listView);
    listView.layoutSizingHorizontal = 'FILL';

    return colorSetFrame;
}

async function createPaletteContainer(colors: ColorData[]): Promise<FrameNode> {
    const container = figma.createFrame();
    container.name = 'Palette Container';
    container.cornerRadius = 8;
    container.strokes = [{ type: 'SOLID', color: hexToFigmaColor(UI_CONSTANTS.colors.border) }];
    container.strokeWeight = 1;
    container.layoutMode = 'HORIZONTAL';
    container.itemSpacing = 0;
    container.clipsContent = true;
    container.layoutSizingVertical = 'HUG';

    // 색상 수에 따라 각 칩의 너비 계산
    const chipWidth = Math.max(80, (UI_CONSTANTS.width - 64) / colors.length);

    // 모든 color chip을 생성한 후 컨테이너에 추가
    for (const colorData of colors) {
        const colorChip = await createColorChip(colorData, chipWidth);
        container.appendChild(colorChip);
    }

    return container;
}

async function createColorChip(colorData: ColorData, width: number): Promise<FrameNode> {
    const chip = figma.createFrame();
    chip.name = colorData.name;
    chip.fills = [{ type: 'SOLID', color: hexToFigmaColor(colorData.hex) }];
    chip.resize(width, UI_CONSTANTS.chipHeight);
    chip.layoutMode = 'VERTICAL';
    chip.itemSpacing = 2;
    chip.paddingTop = 10;
    chip.paddingLeft = 12;
    chip.paddingRight = 12;
    chip.paddingBottom = 10;
    chip.primaryAxisAlignItems = 'MIN';

    // 색상 이름
    const nameText = figma.createText();
    nameText.name = 'Color Name';
    await setTextSafely(nameText, colorData.name, 12, 'Medium');
    nameText.fills = [
        {
            type: 'SOLID',
            color: hexToFigmaColor(colorData.textColor || getContrastColor(colorData.hex)),
        },
    ];
    chip.appendChild(nameText);

    // HEX 값
    const hexText = figma.createText();
    hexText.name = 'Hex Value';
    await setTextSafely(hexText, colorData.hex.toUpperCase(), 12, 'Regular');
    hexText.fills = [
        {
            type: 'SOLID',
            color: hexToFigmaColor(colorData.textColor || getContrastColor(colorData.hex)),
        },
    ];
    chip.appendChild(hexText);

    return chip;
}

async function createListView(colors: ColorData[]): Promise<FrameNode> {
    const listView = figma.createFrame();
    listView.name = 'List View';
    listView.layoutMode = 'VERTICAL';
    listView.itemSpacing = 0;
    listView.resize(UI_CONSTANTS.width - 64, calculateListHeight(colors.length));

    // 리스트 헤더
    const listHeader = await createListHeader();
    listView.appendChild(listHeader);
    listHeader.layoutSizingHorizontal = 'FILL';

    // 리스트 아이템들
    for (const colorData of colors) {
        const listItem = await createListItem(colorData);
        listView.appendChild(listItem);
        listItem.layoutSizingHorizontal = 'FILL';
    }

    return listView;
}

async function createListHeader(): Promise<FrameNode> {
    const header = figma.createFrame();
    header.name = 'List Header';
    header.layoutMode = 'HORIZONTAL';
    header.itemSpacing = 16;
    header.paddingBottom = 16;
    header.resize(UI_CONSTANTS.width - 64, 40);

    // 하단 보더
    header.strokes = [{ type: 'SOLID', color: hexToFigmaColor(UI_CONSTANTS.colors.border) }];
    header.strokeWeight = 1;
    header.strokeAlign = 'OUTSIDE';

    // Name 컬럼
    const nameColumn = figma.createText();
    nameColumn.name = 'Name Column';
    await setTextSafely(nameColumn, 'Name', 16, 'Medium');
    nameColumn.fills = [
        { type: 'SOLID', color: hexToFigmaColor(UI_CONSTANTS.colors.text.secondary) },
    ];
    header.appendChild(nameColumn);

    // Value 컬럼
    const valueColumn = figma.createText();
    valueColumn.name = 'Value Column';
    await setTextSafely(valueColumn, 'Value', 16, 'Medium');
    valueColumn.fills = [
        { type: 'SOLID', color: hexToFigmaColor(UI_CONSTANTS.colors.text.secondary) },
    ];
    header.appendChild(valueColumn);

    // 부모에 추가된 후에 sizing 설정
    nameColumn.layoutSizingHorizontal = 'FILL';
    valueColumn.layoutSizingHorizontal = 'FILL';

    return header;
}

async function createListItem(colorData: ColorData): Promise<FrameNode> {
    const item = figma.createFrame();
    item.name = 'List Item';
    item.layoutMode = 'HORIZONTAL';
    item.itemSpacing = 16;
    item.paddingTop = 16;
    item.paddingBottom = 16;
    item.resize(UI_CONSTANTS.width - 64, UI_CONSTANTS.listRowHeight);

    // 하단 보더
    item.strokes = [{ type: 'SOLID', color: hexToFigmaColor(UI_CONSTANTS.colors.border) }];
    item.strokeWeight = 1;
    item.strokeAlign = 'OUTSIDE';

    // Name 컬럼
    const nameText = figma.createText();
    nameText.name = 'Name';
    await setTextSafely(nameText, colorData.name, 16, 'Medium');
    nameText.fills = [{ type: 'SOLID', color: hexToFigmaColor(UI_CONSTANTS.colors.text.primary) }];
    item.appendChild(nameText);

    // Value 컬럼 (색상 스와치 + HEX 값)
    const valueColumn = figma.createFrame();
    valueColumn.name = 'Value Column';
    valueColumn.layoutMode = 'HORIZONTAL';
    valueColumn.itemSpacing = 12;
    valueColumn.primaryAxisAlignItems = 'MIN';
    valueColumn.counterAxisAlignItems = 'CENTER';
    valueColumn.layoutSizingVertical = 'HUG';

    // 색상 스와치
    const colorSwatch = figma.createFrame();
    colorSwatch.name = 'Color Swatch';
    colorSwatch.resize(32, 32);
    colorSwatch.cornerRadius = 8;
    colorSwatch.fills = [{ type: 'SOLID', color: hexToFigmaColor(colorData.hex) }];
    colorSwatch.strokes = [{ type: 'SOLID', color: hexToFigmaColor(UI_CONSTANTS.colors.border) }];
    colorSwatch.strokeWeight = 1;
    valueColumn.appendChild(colorSwatch);

    // 색상 값들을 세로로 배열하는 컨테이너
    const colorValuesContainer = figma.createFrame();
    colorValuesContainer.name = 'Color Values';
    colorValuesContainer.layoutMode = 'VERTICAL';
    colorValuesContainer.itemSpacing = 2;
    colorValuesContainer.layoutSizingHorizontal = 'HUG';
    colorValuesContainer.layoutSizingVertical = 'HUG';

    // HEX 값
    const hexText = figma.createText();
    hexText.name = 'Hex Value';
    await setTextSafely(hexText, colorData.hex.toUpperCase(), 14, 'Medium');
    hexText.fills = [{ type: 'SOLID', color: hexToFigmaColor(UI_CONSTANTS.colors.text.primary) }];
    colorValuesContainer.appendChild(hexText);

    // OKLCH 값
    const oklchText = figma.createText();
    oklchText.name = 'OKLCH Value';
    await setTextSafely(oklchText, colorData.oklch, 12, 'Regular');
    oklchText.fills = [{ type: 'SOLID', color: hexToFigmaColor(UI_CONSTANTS.colors.text.secondary) }];
    colorValuesContainer.appendChild(oklchText);

    valueColumn.appendChild(colorValuesContainer);

    item.appendChild(valueColumn);

    // 부모에 추가된 후에 sizing 설정
    nameText.layoutSizingHorizontal = 'FILL';
    valueColumn.layoutSizingHorizontal = 'FILL';

    return item;
}

// ============================================================================
// Utility Functions
// ============================================================================
function calculateColorSetHeight(colorCount: number): number {
    const headerHeight = 50; // 제목 + 보더
    const paletteHeight = UI_CONSTANTS.chipHeight;
    const listHeight = calculateListHeight(colorCount);
    const padding = 64; // top + bottom
    const spacing = UI_CONSTANTS.spacing.palette * 3; // 제목, 팔레트, 리스트 간 간격

    return headerHeight + paletteHeight + listHeight + padding + spacing;
}

function calculateListHeight(colorCount: number): number {
    const headerHeight = 40;
    const itemHeight = UI_CONSTANTS.listRowHeight;
    return headerHeight + itemHeight * colorCount;
}
