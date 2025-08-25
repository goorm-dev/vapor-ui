import { BackgroundColor, Color, CssColor, Theme } from '@adobe/leonardo-contrast-colors';
import { formatCss, formatHex, oklch } from 'culori';

// ============================================================================
// Configuration (완전 단순화)
// ============================================================================

/**
 * ✨ 완전 단순화: 중첩 객체 제거
 * main만 있으니까 굳이 객체로 감쌀 이유 없음
 */
const MAIN_BACKGROUND_LIGHTNESS = {
    light: 100, // 대비비 계산 기준
    dark: 14, // 대비비 계산 기준
} as const;

/**
 * Semantic Background Mapping (layer1, layer2용)
 */
const SEMANTIC_BACKGROUND_MAPPING = {
    light: {
        layer1: 'gray-50', // #efefef
        layer2: 'gray-100', // #e1e1e1
    },
    dark: {
        layer1: 'gray-800', // 어두운 배경
        layer2: 'gray-700', // 조금 더 밝음
    },
} as const;

// 기존 설정들
const PRIMITIVE_COLORS = {
    red: '#DF3337',
    pink: '#DA2F74',
    grape: '#BE2CE2',
    violet: '#8754F9',
    blue: '#2A6FF3',
    cyan: '#0E81A0',
    green: '#0A8672',
    lime: '#8FD327',
    yellow: '#FABB00',
    orange: '#D14905',
};

const CONTRAST_RATIOS = {
    '50': 1.15,
    '100': 1.3,
    '200': 1.7,
    '300': 2.5,
    '400': 3.2,
    '500': 4.5,
    '600': 6.5,
    '700': 8.5,
    '800': 11.5,
    '900': 15.0,
};

// ============================================================================
// 타입 정의 (단순화됨)
// ============================================================================

type ThemeType = 'light' | 'dark';

interface OklchColor {
    mode: 'oklch';
    l: number;
    c: number;
    h?: number;
}

// ============================================================================
// 색상 생성 로직 (기존과 동일)
// ============================================================================

const createColorDefinition = ({
    name,
    colorHex,
}: {
    name: string;
    colorHex: string;
}): Color | null => {
    const brandColorOklch = oklch(colorHex);
    if (!brandColorOklch) {
        console.warn(`Invalid brand color: ${name} - ${colorHex}. Skipping.`);
        return null;
    }

    const adaptiveL = brandColorOklch.l * Math.max(0.35, 0.25);
    const adaptiveC = brandColorOklch.c * 0.85;

    const darkerKeyOklch: OklchColor = {
        ...brandColorOklch,
        mode: 'oklch',
        l: adaptiveL,
        c: adaptiveC,
    };

    return new Color({
        name,
        colorKeys: [colorHex as CssColor, formatHex(darkerKeyOklch) as CssColor],
        colorspace: 'OKLCH',
        ratios: CONTRAST_RATIOS,
    });
};

const vaporColorDefinitions = Object.entries(PRIMITIVE_COLORS)
    .map(([name, colorHex]) => createColorDefinition({ name, colorHex }))
    .filter((c): c is Color => c !== null);

// ============================================================================
// 테마 생성
// ============================================================================

const createTheme = (themeType: ThemeType): Theme => {
    const lightness = MAIN_BACKGROUND_LIGHTNESS[themeType];
    const colorKey = (themeType === 'light' ? '#FFFFFF' : '#000000') as CssColor;

    const background = new BackgroundColor({
        name: 'gray',
        colorKeys: [colorKey],
        ratios: CONTRAST_RATIOS,
    });

    return new Theme({
        colors: [...vaporColorDefinitions, background],
        backgroundColor: background,
        lightness,
        output: 'HEX',
    });
};

// ============================================================================
// CSS 생성
// ============================================================================

interface PrimitiveToken {
    name: string;
    hexValue: string;
    oklchValue: string;
}

interface SemanticToken {
    name: string;
    reference: string;
}

function generatePrimitiveTokens(themeType: ThemeType): PrimitiveToken[] {
    const theme = createTheme(themeType);
    const [backgroundObj, ...colors] = theme.contrastColors;

    const primitives: PrimitiveToken[] = [];

    // background-main primitive 추가
    if ('background' in backgroundObj) {
        const oklchColor = oklch(backgroundObj.background);
        const oklchValue = formatCss(oklchColor);

        if (oklchValue) {
            primitives.push({
                name: '--vapor-color-background-main',
                hexValue: backgroundObj.background,
                oklchValue: oklchValue,
            });
        }
    }

    // 색상 팔레트들 (gray 포함)
    colors.forEach((color) => {
        if ('name' in color && 'values' in color) {
            color.values.forEach((instance) => {
                const oklchColor = oklch(instance.value);
                const oklchValue = formatCss(oklchColor);

                if (oklchValue) {
                    primitives.push({
                        name: `--vapor-color-${color.name}-${instance.name}`,
                        hexValue: instance.value,
                        oklchValue: oklchValue,
                    });
                }
            });
        }
    });

    return primitives;
}

function generateSemanticTokens(themeType: ThemeType): SemanticToken[] {
    const mapping = SEMANTIC_BACKGROUND_MAPPING[themeType];

    return Object.entries(mapping).map(([semanticName, primitiveRef]) => ({
        name: `--vapor-color-background-${semanticName}`,
        reference: `var(--vapor-color-${primitiveRef})`,
    }));
}

function generateSimplifiedCssVariables(themeType: ThemeType): string {
    const lines: string[] = [`:root[data-theme="${themeType}"] {`];

    // Primitive Tokens
    lines.push('  /* === Primitive Tokens === */');
    const primitives = generatePrimitiveTokens(themeType);
    primitives.forEach(({ name, hexValue, oklchValue }) => {
        lines.push(`  ${name}: ${oklchValue};`);
        lines.push(`  ${name}: ${hexValue};`);
    });

    // Semantic Tokens
    lines.push('');
    lines.push('  /* === Semantic Tokens === */');
    const semantics = generateSemanticTokens(themeType);
    semantics.forEach(({ name, reference }) => {
        lines.push(`  ${name}: ${reference};`);
    });

    lines.push('}');
    return lines.join('\n');
}

// ============================================================================
// Export
// ============================================================================

export const lightThemeCss = generateSimplifiedCssVariables('light');
export const darkThemeCss = generateSimplifiedCssVariables('dark');

export type { ThemeType };
