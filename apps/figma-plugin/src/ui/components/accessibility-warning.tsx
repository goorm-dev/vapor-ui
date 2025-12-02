import type { ContrastRatios } from '@vapor-ui/color-generator';
import { Box, HStack, Text, VStack } from '@vapor-ui/core';
import { WarningOutlineIcon } from '@vapor-ui/icons';

interface AccessibilityWarningProps {
    primaryBackgroundHex: string;
    canvasBackgroundHex: string;
    primaryColorName: string;
    backgroundColorName: string;
    primaryMappedStep: string;
    backgroundLightness: number;
    contrastRatios: ContrastRatios;
}

interface Suggestion {
    text: string;
    emphasis?: string;
}

/** WCAG AA UI 컴포넌트 기준 명암비 (3:1) */
const WCAG_AA_UI_THRESHOLD = 3.0;

/**
 * 해당 step의 대비율이 WCAG AA UI 컴포넌트 기준(3:1)을 충족하는지 확인합니다.
 * 사용자가 커스텀한 contrastRatios 값을 기반으로 판단합니다.
 */
const meetsWcagAA = (step: string, contrastRatios: ContrastRatios): boolean => {
    const ratio = contrastRatios[step];
    if (ratio === undefined) return true; // 알 수 없는 step은 경고하지 않음
    return ratio >= WCAG_AA_UI_THRESHOLD;
};

/**
 * WCAG AA 기준(3:1)을 충족하는 최소 step을 찾습니다.
 */
const findMinimumPassingStep = (contrastRatios: ContrastRatios): string | null => {
    const steps = Object.keys(contrastRatios).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
    for (const step of steps) {
        if (contrastRatios[step] >= WCAG_AA_UI_THRESHOLD) {
            return step;
        }
    }
    return null;
};

const getSuggestions = (
    _step: string,
    backgroundLightness: number,
    contrastRatios: ContrastRatios,
): Suggestion[] => {
    const suggestions: Suggestion[] = [];
    const canIncreaseLightness = backgroundLightness < 100;
    const minimumPassingStep = findMinimumPassingStep(contrastRatios);

    if (canIncreaseLightness) {
        suggestions.push({
            text: '배경 Lightness를 높여보세요.',
            emphasis: `현재 ${backgroundLightness}% → 100%로 설정하면 대비율이 개선돼요.`,
        });
    }

    if (minimumPassingStep) {
        suggestions.push({
            text: '더 진한(어두운) 브랜드 색상을 선택해 보세요.',
            emphasis: `${minimumPassingStep} 이상 단계에 매핑되면 WCAG AA 기준을 충족해요.`,
        });
    } else {
        suggestions.push({
            text: 'Contrast Ratios 설정에서 3.0 이상의 값을 가진 단계를 추가해 보세요.',
        });
    }

    return suggestions;
};

export const AccessibilityWarning = ({
    primaryBackgroundHex,
    canvasBackgroundHex,
    primaryColorName,
    primaryMappedStep,
    backgroundLightness,
    contrastRatios,
}: AccessibilityWarningProps) => {
    if (meetsWcagAA(primaryMappedStep, contrastRatios)) {
        return null;
    }

    const suggestions = getSuggestions(primaryMappedStep, backgroundLightness, contrastRatios);
    const contrastRatio = contrastRatios[primaryMappedStep]?.toString() ?? '< 3.0';

    return (
        <Box className="p-3 bg-v-orange-050 border border-v-orange-200 rounded-lg">
            <VStack gap="$100">
                <HStack gap="$100" alignItems="center">
                    <WarningOutlineIcon className="w-4 h-4 text-v-orange-600 flex-shrink-0" />
                    <Text typography="subtitle2" foreground="warning-100">
                        접근성 경고
                    </Text>
                </HStack>

                <VStack gap="$050">
                    <Text typography="body3" foreground="hint-200">
                        <Text typography="body3" foreground="normal-100" render={<span />}>
                            {primaryColorName}
                        </Text>
                        가{' '}
                        <Text
                            typography="body3"
                            foreground="warning-100"
                            render={<span className="font-semibold" />}
                        >
                            {primaryMappedStep}
                        </Text>
                        단계에 매핑되어, 배경 대비 명암비가 약{' '}
                        <Text
                            typography="body3"
                            foreground="warning-100"
                            render={<span className="font-semibold" />}
                        >
                            {contrastRatio}:1
                        </Text>
                        이에요.
                    </Text>

                    <Text typography="body3" foreground="hint-200">
                        WCAG AA UI 컴포넌트 기준(3:1)을 충족하지 않아, 버튼 등에서 가독성 문제가
                        발생할 수 있어요.
                    </Text>
                </VStack>

                <Box className="mt-1 pl-2 border-l-2 border-v-orange-300">
                    <VStack gap="$100">
                        <Text typography="body4" foreground="hint-100">
                            권장 사항
                        </Text>
                        {suggestions.map((suggestion, index) => (
                            <VStack key={index} gap="$000">
                                <HStack gap="$050" alignItems="flex-start">
                                    <Text typography="body3" foreground="warning-100">
                                        •
                                    </Text>
                                    <Text typography="body3" foreground="warning-100">
                                        {suggestion.text}
                                    </Text>
                                </HStack>
                                {suggestion.emphasis && (
                                    <Text typography="body4" foreground="hint-200" className="ml-3">
                                        {suggestion.emphasis}
                                    </Text>
                                )}
                            </VStack>
                        ))}
                    </VStack>
                </Box>

                <HStack gap="$100" className="mt-2">
                    <Box className="flex-1 flex items-center gap-2 p-2 bg-white rounded border border-v-gray-200">
                        <Box
                            className="w-6 h-6 rounded border border-v-gray-300"
                            style={{ backgroundColor: primaryBackgroundHex }}
                        />
                        <VStack gap="$000">
                            <Text typography="body4" foreground="hint-100">
                                Primary ({primaryMappedStep})
                            </Text>
                            <Text typography="body4" foreground="hint-200">
                                {primaryBackgroundHex}
                            </Text>
                        </VStack>
                    </Box>
                    <Box className="flex-1 flex items-center gap-2 p-2 bg-white rounded border border-v-gray-200">
                        <Box
                            className="w-6 h-6 rounded border border-v-gray-300"
                            style={{ backgroundColor: canvasBackgroundHex }}
                        />
                        <VStack gap="$000">
                            <Text typography="body4" foreground="hint-100">
                                Background
                            </Text>
                            <Text typography="body4" foreground="hint-200">
                                {canvasBackgroundHex}
                            </Text>
                        </VStack>
                    </Box>
                </HStack>
            </VStack>
        </Box>
    );
};
