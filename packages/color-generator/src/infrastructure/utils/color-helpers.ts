import { lch } from 'culori';

/**
 * HEX 색상에서 LCH Lightness 값을 추출합니다.
 *
 * @description
 * `generatePrimitiveColorPalette`의 `backgroundColor.lightness` 옵션을
 * 사용자 입력 hexcode와 일치시키고 싶을 때 유용한 companion utility입니다.
 *
 * @param colorHex - HEX 색상 값 (예: '#dbe0ea')
 * @returns 0-100 범위의 정수 lightness 값 또는 null
 *
 * @example
 * ```typescript
 * const userInput = '#dbe0ea';
 * const lightness = getColorLightness(userInput); // 89
 *
 * const theme = generatePrimitiveColorPalette({
 *   backgroundColor: {
 *     name: 'custom',
 *     hexcode: userInput,
 *     lightness: { light: lightness, dark: 14 }
 *   }
 * });
 * // → #dbe0ea가 그대로 사용됨 (lightness 89로 계산되므로)
 * ```
 */
export const getColorLightness = (colorHex: string): number | null => {
    const lchColor = lch(colorHex);
    if (lchColor && typeof lchColor.l === 'number') {
        return Math.round(lchColor.l);
    }
    return null;
};
