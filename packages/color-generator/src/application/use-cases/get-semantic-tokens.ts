import type {
    BackgroundCanvas,
    PaletteChip,
    PrimitivePalette,
    SemanticResult,
    SemanticTokens,
} from '../../domain';
import {
    extractOklchLightness,
    findLowestDeltaEChip,
    getNextNextStep,
    getNextStep,
} from '../utils';

/**
 * getSemanticDependentTokens 함수의 파라미터 인터페이스
 */
export interface GetSemanticDependentTokensParams {
    primaryColorPalette: PrimitivePalette;
    canvasColorPalette: PrimitivePalette;
    lightModeCanvas: BackgroundCanvas;
    darkModeCanvas: BackgroundCanvas;
    baseTokens: Record<string, PaletteChip>;
}

/**
 * getSemanticDependentTokens Use Case
 *
 * generatePrimitiveColorPalette에서 생성된 Primitive Palette를 입력받아,
 * 실제 애플리케이션에서 사용될 시맨틱(Semantic) 토큰으로 매핑하는 규칙을 제공합니다.
 */
export function getSemanticDependentTokens({
    primaryColorPalette,
    canvasColorPalette,
    lightModeCanvas,
    darkModeCanvas,
    baseTokens,
}: GetSemanticDependentTokensParams): SemanticResult {
    // Light Mode 시맨틱 토큰 생성
    const lightModeTokens = generateLightModeSemanticTokens(
        primaryColorPalette,
        canvasColorPalette,
        lightModeCanvas,
        baseTokens,
    );

    // Dark Mode 시맨틱 토큰 생성
    const darkModeTokens = generateDarkModeSemanticTokens(
        primaryColorPalette,
        canvasColorPalette,
        darkModeCanvas,
        baseTokens,
    );

    return {
        lightModeTokens,
        darkModeTokens,
    };
}

/**
 * Light Mode 시맨틱 토큰 생성
 */
function generateLightModeSemanticTokens(
    primaryColorPalette: PrimitivePalette,
    canvasColorPalette: PrimitivePalette,
    backgroundCanvas: BackgroundCanvas,
    baseTokens: Record<string, PaletteChip>,
): SemanticTokens {
    const lowestDeltaEChip = findLowestDeltaEChip(primaryColorPalette);
    const lowestDeltaEStep = extractStepFromChipName(lowestDeltaEChip.name);

    let backgroundPrimary100: string;
    if (lowestDeltaEChip.deltaE === 0 && lowestDeltaEChip.name.includes('050')) {
        backgroundPrimary100 = lowestDeltaEChip.name;
    } else {
        backgroundPrimary100 = primaryColorPalette.chips['100']?.name || lowestDeltaEChip.name;
    }

    const backgroundPrimary200 = lowestDeltaEChip.name;
    const borderPrimary = backgroundPrimary200;

    const foregroundPrimary100Step = getNextStep(lowestDeltaEStep);
    const foregroundPrimary100 =
        primaryColorPalette.chips[foregroundPrimary100Step]?.name ||
        primaryColorPalette.chips['900'].name;

    const foregroundPrimary200Step = getNextNextStep(lowestDeltaEStep);
    const foregroundPrimary200 =
        primaryColorPalette.chips[foregroundPrimary200Step]?.name ||
        primaryColorPalette.chips['900'].name;

    const backgroundCanvas100 = backgroundCanvas.name;
    const backgroundCanvas200 = canvasColorPalette.chips['050']?.name || backgroundCanvas.name;
    const backgroundOverlay100 = backgroundCanvas.name;
    const borderNormal = canvasColorPalette.chips['100']?.name || backgroundCanvas.name;

    // Adaptive Contrast Rule: lightness >= 0.65이면 color-black, 아니면 color-white
    const primary200Chip = primaryColorPalette.chips[lowestDeltaEStep];
    const lightness = extractOklchLightness(primary200Chip?.oklch || lowestDeltaEChip.oklch);
    const primaryPrimaryInverse =
        lightness >= 0.65 ? baseTokens['color-black'].name : baseTokens['color-white'].name;

    return {
        'color-background-primary-100': backgroundPrimary100,
        'color-background-primary-200': backgroundPrimary200,
        'color-border-primary': borderPrimary,
        'color-border-normal': borderNormal,
        'color-foreground-primary-100': foregroundPrimary100,
        'color-foreground-primary-200': foregroundPrimary200,
        'color-background-canvas-100': backgroundCanvas100,
        'color-background-canvas-200': backgroundCanvas200,
        'color-background-overlay-100': backgroundOverlay100,
        'color-foreground-inverse': primaryPrimaryInverse,
    };
}

/**
 * Dark Mode 시맨틱 토큰 생성
 */
function generateDarkModeSemanticTokens(
    primaryColorPalette: PrimitivePalette,
    canvasColorPalette: PrimitivePalette,
    backgroundCanvas: BackgroundCanvas,
    baseTokens: Record<string, PaletteChip>,
): SemanticTokens {
    const lowestDeltaEChip = findLowestDeltaEChip(primaryColorPalette);
    const lowestDeltaEStep = extractStepFromChipName(lowestDeltaEChip.name);

    const backgroundPrimary100 =
        primaryColorPalette.chips['050']?.name || primaryColorPalette.chips['100'].name;
    const backgroundPrimary200 = lowestDeltaEChip.name;
    const borderPrimary = backgroundPrimary200;

    const foregroundPrimary100Step = getNextStep(lowestDeltaEStep);
    const foregroundPrimary100 =
        primaryColorPalette.chips[foregroundPrimary100Step]?.name ||
        primaryColorPalette.chips['900'].name;

    const foregroundPrimary200Step = getNextNextStep(lowestDeltaEStep);
    const foregroundPrimary200 =
        primaryColorPalette.chips[foregroundPrimary200Step]?.name ||
        primaryColorPalette.chips['900'].name;

    const backgroundCanvas100 = backgroundCanvas.name;
    const backgroundCanvas200 = canvasColorPalette.chips['050']?.name || backgroundCanvas.name;
    const backgroundOverlay100 = canvasColorPalette.chips['100']?.name || backgroundCanvas.name;
    const borderNormal = canvasColorPalette.chips['100']?.name || backgroundCanvas.name;

    const primary200Chip = primaryColorPalette.chips[lowestDeltaEStep];
    const lightness = extractOklchLightness(primary200Chip?.oklch || lowestDeltaEChip.oklch);
    const primaryPrimaryInverse =
        lightness >= 0.65 ? baseTokens['color-black'].name : baseTokens['color-white'].name;

    return {
        'color-background-primary-100': backgroundPrimary100,
        'color-background-primary-200': backgroundPrimary200,
        'color-border-primary': borderPrimary,
        'color-border-normal': borderNormal,
        'color-foreground-primary-100': foregroundPrimary100,
        'color-foreground-primary-200': foregroundPrimary200,
        'color-background-canvas-100': backgroundCanvas100,
        'color-background-canvas-200': backgroundCanvas200,
        'color-background-overlay-100': backgroundOverlay100,
        'color-foreground-inverse': primaryPrimaryInverse,
    };
}

function extractStepFromChipName(chipName: string): string {
    const match = chipName.match(/(\d{3})$/);
    return match ? match[1] : '500';
}
