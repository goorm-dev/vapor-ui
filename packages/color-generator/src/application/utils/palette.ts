import type { PaletteChip, PrimitivePalette } from '../../domain';

/**
 * 팔레트에서 deltaE가 가장 낮은 칩을 찾습니다.
 * Brand Color Swap에서 사용됩니다.
 */
export function findLowestDeltaEChip(palette: PrimitivePalette): PaletteChip {
    const chips = Object.values(palette.chips);
    return chips.reduce((lowest, current) => {
        return current.deltaE < lowest.deltaE ? current : lowest;
    });
}

/**
 * Brand Color Swap을 적용합니다.
 * 가장 낮은 deltaE를 가진 칩의 hex 값을 brandColor로 교체하고 deltaE를 0으로 설정합니다.
 */
export function applyBrandColorSwap(
    palette: PrimitivePalette,
    brandHexcode: string,
): PrimitivePalette {
    const lowestDeltaEChip = findLowestDeltaEChip(palette);

    // 해당 칩을 찾아서 hex 값 교체
    const updatedChips = { ...palette.chips };
    for (const [key, chip] of Object.entries(updatedChips)) {
        if (chip === lowestDeltaEChip) {
            updatedChips[key] = {
                ...chip,
                hex: brandHexcode,
                deltaE: 0,
            };
            break;
        }
    }

    return {
        ...palette,
        chips: updatedChips,
    };
}

/**
 * 팔레트에서 특정 단계의 다음 단계를 반환합니다.
 * 시맨틱 토큰 매핑에서 사용됩니다.
 */
export function getNextStep(currentStep: string): string {
    const steps = ['050', '100', '200', '300', '400', '500', '600', '700', '800', '900'];
    const currentIndex = steps.indexOf(currentStep);

    if (currentIndex === -1 || currentIndex === steps.length - 1) {
        return '900'; // 마지막 단계이거나 찾을 수 없으면 900 반환
    }

    return steps[currentIndex + 1];
}

/**
 * 팔레트에서 특정 단계의 다다음 단계를 반환합니다.
 */
export function getNextNextStep(currentStep: string): string {
    const steps = ['050', '100', '200', '300', '400', '500', '600', '700', '800', '900'];
    const currentIndex = steps.indexOf(currentStep);

    if (currentIndex === -1 || currentIndex >= steps.length - 2) {
        return '900'; // 마지막 두 단계이거나 찾을 수 없으면 900 반환
    }

    return steps[currentIndex + 2];
}
