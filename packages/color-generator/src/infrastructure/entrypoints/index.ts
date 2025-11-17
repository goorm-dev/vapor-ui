import {
    generatePrimitiveColorPalette as generatePrimitiveColorPaletteUseCase,
    getSemanticDependentTokens as getSemanticDependentTokensUseCase,
} from '../../application';
import type { SemanticResult, ThemeOptions, ThemeResult } from '../../domain';
import { leonardoAdapter } from '../adapters';

/**
 * 시스템의 모든 Primitive Color Token을 생성합니다.
 *
 * Leonardo Adapter를 사용하여 단일 기준 배경색을 기반으로
 * 모든 필수 팔레트(시스템 기본, 브랜드 커스텀)를 일관되게 생성합니다.
 *
 * @param options - 테마 생성 옵션
 * @returns Light/Dark 모드별 Primitive Color Tokens
 *
 * @example
 * ```typescript
 * // 기본 옵션으로 생성 (11개 팔레트)
 * const result = generatePrimitiveColorPalette();
 *
 * // 브랜드 색상 추가 (12개 팔레트)
 * const result = generatePrimitiveColorPalette({
 *   brandColor: { name: 'mint', hexcode: '#00BEEF' }
 * });
 *
 * // 커스텀 배경색 (12개 팔레트)
 * const result = generatePrimitiveColorPalette({
 *   backgroundColor: { name: 'beige', hexcode: '#FDF7E0' }
 * });
 * ```
 */
export function generatePrimitiveColorPalette(options?: Partial<ThemeOptions>): ThemeResult {
    return generatePrimitiveColorPaletteUseCase(leonardoAdapter, options);
}

/**
 * Primitive Palette를 시맨틱 토큰으로 매핑합니다.
 *
 * generatePrimitiveColorPalette에서 생성된 Primitive Palette를 입력받아
 * 실제 애플리케이션에서 사용될 시맨틱 토큰으로 매핑합니다.
 *
 * @param themeResult - generatePrimitiveColorPalette의 결과
 * @param primaryColorName - Primary로 사용할 색상 이름 (기본: 'blue')
 * @param canvasColorName - Canvas로 사용할 색상 이름 (기본: 'gray')
 * @returns Light/Dark 모드별 시맨틱 토큰
 *
 * @example
 * ```typescript
 * const primitiveResult = generatePrimitiveColorPalette({
 *   brandColor: { name: 'mint', hexcode: '#00BEEF' }
 * });
 *
 * const semanticResult = getSemanticDependentTokens(primitiveResult, 'mint');
 *
 * // 커스텀 배경색을 사용한 경우
 * const customResult = generatePrimitiveColorPalette({
 *   backgroundColor: { name: 'beige', hexcode: '#fcf6df' }
 * });
 * const semanticResult2 = getSemanticDependentTokens(customResult, 'blue', 'beige');
 * ```
 */
export function getSemanticDependentTokens(
    themeResult: ThemeResult,
    primaryColorName = 'blue',
    canvasColorName = 'gray',
): SemanticResult {
    // Primary 팔레트 찾기
    const lightPrimaryPalette = themeResult.lightModeTokens.palettes.find(
        (p) => p.name === primaryColorName,
    );
    const darkPrimaryPalette = themeResult.darkModeTokens.palettes.find(
        (p) => p.name === primaryColorName,
    );

    if (!lightPrimaryPalette || !darkPrimaryPalette) {
        throw new Error(`Primary color palette '${primaryColorName}' not found in theme result`);
    }

    // Canvas 팔레트 찾기 (배경색 기준)
    const lightCanvasPalette = themeResult.lightModeTokens.palettes.find(
        (p) => p.name === canvasColorName,
    );
    const darkCanvasPalette = themeResult.darkModeTokens.palettes.find(
        (p) => p.name === canvasColorName,
    );

    if (!lightCanvasPalette || !darkCanvasPalette) {
        throw new Error(`Canvas color palette '${canvasColorName}' not found in theme result`);
    }

    // Light Mode 시맨틱 토큰 생성
    const lightSemanticTokens = getSemanticDependentTokensUseCase({
        primaryColorPalette: lightPrimaryPalette,
        canvasColorPalette: lightCanvasPalette,
        lightModeCanvas: themeResult.lightModeTokens.backgroundCanvas,
        darkModeCanvas: themeResult.darkModeTokens.backgroundCanvas,
        baseTokens: themeResult.baseTokens,
    }).lightModeTokens;

    // Dark Mode 시맨틱 토큰 생성
    const darkSemanticTokens = getSemanticDependentTokensUseCase({
        primaryColorPalette: darkPrimaryPalette,
        canvasColorPalette: darkCanvasPalette,
        lightModeCanvas: themeResult.lightModeTokens.backgroundCanvas,
        darkModeCanvas: themeResult.darkModeTokens.backgroundCanvas,
        baseTokens: themeResult.baseTokens,
    }).darkModeTokens;

    return {
        lightModeTokens: lightSemanticTokens,
        darkModeTokens: darkSemanticTokens,
    };
}
