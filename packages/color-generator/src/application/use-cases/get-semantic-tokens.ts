import type {
    BackgroundCanvas,
    PrimitivePalette,
    SemanticResult,
    SemanticTokens,
} from '../../domain';
import { findLowestDeltaEChip, getNextNextStep, getNextStep } from '../utils';

/**
 * getSemanticDependentTokens Use Case
 *
 * generatePrimitiveColorPalette에서 생성된 Primitive Palette를 입력받아,
 * 실제 애플리케이션에서 사용될 시맨틱(Semantic) 토큰으로 매핑하는 규칙을 제공합니다.
 */
export function getSemanticDependentTokens(
    primaryColorPalette: PrimitivePalette,
    canvasColorPalette: PrimitivePalette,
    lightModeCanvas: BackgroundCanvas,
    darkModeCanvas: BackgroundCanvas,
): SemanticResult {
    // Light Mode 시맨틱 토큰 생성
    const lightModeTokens = generateLightModeSemanticTokens(
        primaryColorPalette,
        canvasColorPalette,
        lightModeCanvas,
    );

    // Dark Mode 시맨틱 토큰 생성
    const darkModeTokens = generateDarkModeSemanticTokens(
        primaryColorPalette,
        canvasColorPalette,
        darkModeCanvas,
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
): SemanticTokens {
    // 1. color-background-primary-100: 기본은 100 단계, 예외 처리
    let backgroundPrimary100: string;
    const lowestDeltaEChip = findLowestDeltaEChip(primaryColorPalette);

    if (lowestDeltaEChip.deltaE === 0 && lowestDeltaEChip.name.includes('050')) {
        // Brand Color Swap이 적용되고 050 단계에 매핑된 경우
        backgroundPrimary100 = lowestDeltaEChip.name;
    } else {
        // 기본: 100 단계 사용
        backgroundPrimary100 = primaryColorPalette.chips['100']?.name || lowestDeltaEChip.name;
    }

    // 2. color-background-primary-200: deltaE가 가장 낮은 단계
    const backgroundPrimary200 = lowestDeltaEChip.name;

    // 3. color-border-primary: color-background-primary-200와 동일
    const borderPrimary = backgroundPrimary200;

    // 4. color-foreground-100: primary-200 단계의 다음 단계
    const lowestDeltaEStep = extractStepFromChipName(lowestDeltaEChip.name);
    const foreground100Step = getNextStep(lowestDeltaEStep);
    const foreground100 =
        primaryColorPalette.chips[foreground100Step]?.name || primaryColorPalette.chips['900'].name;

    // 5. color-foreground-200: primary-200 단계의 다다음 단계
    const foreground200Step = getNextNextStep(lowestDeltaEStep);
    const foreground200 =
        primaryColorPalette.chips[foreground200Step]?.name || primaryColorPalette.chips['900'].name;

    // 6. color-background-canvas-100: backgroundCanvas name 사용
    const backgroundCanvas100 = backgroundCanvas.name;

    // 7. color-background-canvas-200: canvasColorPalette의 050 단계
    const backgroundCanvas200 = canvasColorPalette.chips['050']?.name || backgroundCanvas.name;

    // 8. color-background-overlay-100: backgroundCanvas name 사용
    const backgroundOverlay100 = backgroundCanvas.name;

    return {
        'color-background-primary-100': backgroundPrimary100,
        'color-background-primary-200': backgroundPrimary200,
        'color-border-primary': borderPrimary,
        'color-foreground-100': foreground100,
        'color-foreground-200': foreground200,
        'color-background-canvas-100': backgroundCanvas100,
        'color-background-canvas-200': backgroundCanvas200,
        'color-background-overlay-100': backgroundOverlay100,
    };
}

/**
 * Dark Mode 시맨틱 토큰 생성
 */
function generateDarkModeSemanticTokens(
    primaryColorPalette: PrimitivePalette,
    canvasColorPalette: PrimitivePalette,
    backgroundCanvas: BackgroundCanvas,
): SemanticTokens {
    // 1. color-background-primary-100: 050 단계 고정
    const backgroundPrimary100 =
        primaryColorPalette.chips['050']?.name || primaryColorPalette.chips['100'].name;

    // 2. color-background-primary-200: deltaE가 가장 낮은 단계
    const lowestDeltaEChip = findLowestDeltaEChip(primaryColorPalette);
    const backgroundPrimary200 = lowestDeltaEChip.name;

    // 3. color-border-primary: color-background-primary-200와 동일
    const borderPrimary = backgroundPrimary200;

    // 4. color-foreground-100: primary-200 단계의 다음 단계
    const lowestDeltaEStep = extractStepFromChipName(lowestDeltaEChip.name);
    const foreground100Step = getNextStep(lowestDeltaEStep);
    const foreground100 =
        primaryColorPalette.chips[foreground100Step]?.name || primaryColorPalette.chips['900'].name;

    // 5. color-foreground-200: primary-200 단계의 다다음 단계
    const foreground200Step = getNextNextStep(lowestDeltaEStep);
    const foreground200 =
        primaryColorPalette.chips[foreground200Step]?.name || primaryColorPalette.chips['900'].name;

    // 6. color-background-canvas-100: backgroundCanvas name 사용
    const backgroundCanvas100 = backgroundCanvas.name;

    // 7. color-background-canvas-200: canvasColorPalette의 050 단계
    const backgroundCanvas200 = canvasColorPalette.chips['050']?.name || backgroundCanvas.name;

    // 8. color-background-overlay-100: canvasColorPalette의 100 단계
    const backgroundOverlay100 = canvasColorPalette.chips['100']?.name || backgroundCanvas.name;

    return {
        'color-background-primary-100': backgroundPrimary100,
        'color-background-primary-200': backgroundPrimary200,
        'color-border-primary': borderPrimary,
        'color-foreground-100': foreground100,
        'color-foreground-200': foreground200,
        'color-background-canvas-100': backgroundCanvas100,
        'color-background-canvas-200': backgroundCanvas200,
        'color-background-overlay-100': backgroundOverlay100,
    };
}

/**
 * 칩 이름에서 단계 추출 (예: "color-blue-500" -> "500")
 */
function extractStepFromChipName(chipName: string): string {
    const match = chipName.match(/(\d{3})$/);
    return match ? match[1] : '500'; // 기본값
}
