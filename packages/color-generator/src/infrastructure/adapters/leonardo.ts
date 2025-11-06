import type { CssColor } from '@adobe/leonardo-contrast-colors';
import { BackgroundColor, Color, Theme } from '@adobe/leonardo-contrast-colors';
import { differenceCiede2000, formatCss, formatHex, oklch } from 'culori';

import type {
    BackgroundCanvas,
    ColorGeneratorPort,
    LeonardoAdapterInput,
    OklchColor,
    PaletteChip,
    PrimitiveColorTokens,
    PrimitivePalette,
} from '../../domain';

/**
 * Leonardo Adapter 구현
 *
 * @adobe/leonardo-contrast-colors 라이브러리의 인터페이스를
 * 디자인 시스템의 데이터 구조에 맞게 변환하는 Adapter입니다.
 */
export class LeonardoAdapter implements ColorGeneratorPort {
    /**
     * Leonardo Adapter를 통해 Primitive Color Palette를 생성합니다.
     */
    generatePalette(input: LeonardoAdapterInput): PrimitiveColorTokens {
        // 1. Leonardo Color 정의들 생성
        const colorDefinitions = input.colors
            .map((keyColor) =>
                this.createColorDefinition({
                    name: keyColor.name,
                    colorHex: keyColor.hexcode,
                    contrastRatios: input.contrastRatios,
                }),
            )
            .filter((def): def is Color => def !== null);

        // 2. Leonardo Theme 생성
        const theme = this.createLeonardoTheme({
            colorDefinitions,
            backgroundColor: input.backgroundColor.hexcode,
            backgroundName: input.backgroundColor.name,
            lightness: input.lightness,
            contrastRatios: input.contrastRatios,
        });

        // 3. 결과 파싱 및 변환
        const [backgroundObj, ...themeColors] = theme.contrastColors;

        // 4. Background Canvas 추출
        const backgroundCanvas = this.extractBackgroundCanvas(backgroundObj);

        // 5. 팔레트들 변환 (N개의 colors + 1개의 backgroundColor 팔레트)
        const allColors = [...input.colors, input.backgroundColor];
        const palettes = themeColors.map((color) =>
            this.convertToPrimitivePalette(color, allColors),
        );

        return {
            palettes,
            backgroundCanvas,
        };
    }

    /**
     * 입력 색상의 명도를 분석하여 최적의 Light/Dark Key 쌍을 생성합니다.
     * Duo-Key 생성 로직입니다.
     */
    private createAdaptiveColorKeys = (
        brandColorOklch: OklchColor,
        originalHex: string,
    ): { lightKey: CssColor; darkKey: CssColor } => {
        const LIGHTNESS_THRESHOLD = 0.65;
        const DARK_LIGHTNESS_FACTOR = 0.7;
        const CHROMA_REDUCTION_FACTOR = 1.1;
        const LIGHT_LIGHTNESS_FACTOR = 0.9;

        const isLightColor = brandColorOklch.l > LIGHTNESS_THRESHOLD;

        if (isLightColor) {
            const darkerKeyOklch: OklchColor = {
                ...brandColorOklch,
                mode: 'oklch',
                l: brandColorOklch.l * DARK_LIGHTNESS_FACTOR,
                c: brandColorOklch.c * CHROMA_REDUCTION_FACTOR,
            };

            const darkKeyHex = formatHex(darkerKeyOklch);
            return {
                lightKey: originalHex as CssColor,
                darkKey: (darkKeyHex ?? originalHex) as CssColor,
            };
        } else {
            const lighterKeyOklch: OklchColor = {
                ...brandColorOklch,
                mode: 'oklch',
                l: Math.min(brandColorOklch.l / DARK_LIGHTNESS_FACTOR, LIGHT_LIGHTNESS_FACTOR),
                c: brandColorOklch.c * CHROMA_REDUCTION_FACTOR,
            };

            const lightKeyHex = formatHex(lighterKeyOklch);
            return {
                lightKey: (lightKeyHex ?? originalHex) as CssColor,
                darkKey: originalHex as CssColor,
            };
        }
    };

    /**
     * Adobe Leonardo Color 정의 객체를 생성합니다.
     */
    private createColorDefinition = ({
        name,
        colorHex,
        contrastRatios,
    }: {
        name: string;
        colorHex: string;
        contrastRatios: Record<string, number>;
    }): Color | null => {
        const brandColorOklch = oklch(colorHex);
        if (!brandColorOklch) {
            console.warn(`Invalid brand color: ${name} - ${colorHex}. Skipping.`);
            return null;
        }

        const { lightKey, darkKey } = this.createAdaptiveColorKeys(brandColorOklch, colorHex);

        return new Color({
            name,
            colorKeys: [lightKey, darkKey],
            colorspace: 'OKLCH',
            ratios: contrastRatios,
        });
    };

    /**
     * Adobe Leonardo Theme 객체를 생성합니다.
     */
    private createLeonardoTheme = ({
        colorDefinitions,
        backgroundColor,
        backgroundName,
        lightness,
        contrastRatios,
    }: {
        colorDefinitions: Color[];
        backgroundColor: string;
        backgroundName: string;
        lightness: number;
        contrastRatios: Record<string, number>;
    }): Theme => {
        const backgroundColorObj = new BackgroundColor({
            name: backgroundName,
            colorKeys: [backgroundColor as CssColor],
            ratios: contrastRatios,
        });

        return new Theme({
            colors: [...colorDefinitions, backgroundColorObj],
            backgroundColor: backgroundColorObj,
            lightness,
            output: 'HEX',
        });
    };

    /**
     * Leonardo 결과에서 Background Canvas를 추출합니다.
     */
    private extractBackgroundCanvas = (backgroundObj: any): BackgroundCanvas => {
        if (!('background' in backgroundObj)) {
            throw new Error('Invalid background object from Leonardo');
        }

        const oklchColor = oklch(backgroundObj.background);
        const oklchValue = formatCss(oklchColor);

        if (!oklchValue) {
            throw new Error('Failed to convert background canvas to OKLCH');
        }

        return {
            name: 'color-background-canvas',
            hex: backgroundObj.background,
            oklch: this.formatOklchForWeb(oklchValue),
            codeSyntax: 'vapor-color-background-canvas',
        };
    };

    /**
     * Leonardo Color 결과를 PrimitivePalette로 변환합니다.
     */
    private convertToPrimitivePalette = (
        leonardoColor: any,
        originalColors: Array<{ name: string; hexcode: string }>,
    ): PrimitivePalette => {
        if (
            !('name' in leonardoColor) ||
            !('values' in leonardoColor) ||
            !leonardoColor.values.length
        ) {
            throw new Error(`Invalid Leonardo color result: ${JSON.stringify(leonardoColor)}`);
        }

        const colorName = leonardoColor.name;
        const originalColorHex = originalColors.find((c) => c.name === colorName)?.hexcode;

        const calculateDeltaE = differenceCiede2000();
        const chips: Record<string, PaletteChip> = {};

        leonardoColor.values.forEach((instance: any) => {
            const oklchColor = oklch(instance.value);
            const oklchValue = formatCss(oklchColor);

            if (oklchValue) {
                let deltaE = 0;
                if (originalColorHex) {
                    deltaE =
                        Math.round(calculateDeltaE(originalColorHex, instance.value) * 100) / 100;
                }

                const chipName = this.generateTokenName([colorName, instance.name]);
                chips[instance.name] = {
                    name: chipName,
                    hex: instance.value,
                    oklch: this.formatOklchForWeb(oklchValue),
                    deltaE,
                    codeSyntax: this.generateCodeSyntax([colorName, instance.name]),
                };
            }
        });

        return {
            name: colorName,
            chips,
        };
    };

    /**
     * OKLCH 값을 웹용 형식으로 포맷팅합니다. (소수점 2자리로 반올림)
     */
    private formatOklchForWeb = (oklchString: string): string => {
        return oklchString.replace(/oklch\(([^)]+)\)/, (_, content) => {
            const parts = content.trim().split(/\s+/);
            if (parts.length >= 3) {
                const [l, c, h] = parts;

                // 각 값을 소수점 2자리로 반올림
                const lightness = Math.round(parseFloat(l) * 100) / 100;
                const chroma = Math.round(parseFloat(c) * 100) / 100;
                const hue =
                    h === 'none' || h === undefined ? '0' : Math.round(parseFloat(h) * 100) / 100;

                return `oklch(${lightness} ${chroma} ${hue})`;
            }
            return oklchString;
        });
    };

    /**
     * 토큰 이름을 생성합니다.
     */
    private generateTokenName = (parts: string[]): string => {
        return ['color', ...parts].join('-');
    };

    /**
     * 코드 문법용 이름을 생성합니다.
     */
    private generateCodeSyntax = (parts: string[]): string => {
        return ['vapor', 'color', ...parts].join('-');
    };
}
