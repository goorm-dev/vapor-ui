import type { PaletteCheck } from '@vapor-ui/color-generator';
import { Box, HStack, Text, VStack } from '@vapor-ui/core';
import { WarningOutlineIcon } from '@vapor-ui/icons';

interface AccessibilityWarningProps {
    checks: PaletteCheck[];
}

/**
 * `validatePalette` 결과 중 warn/fail 항목과 그 상세를 보여줍니다. 모두 ok면 렌더하지 않습니다.
 */
export const AccessibilityWarning = ({ checks }: AccessibilityWarningProps) => {
    const issues = checks.filter((check) => check.status !== 'ok');
    if (issues.length === 0) return null;

    return (
        <Box className="p-3 bg-v-orange-050 border border-v-orange-200 rounded-lg">
            <VStack $css={{ gap: '$100' }}>
                <HStack $css={{ gap: '$100', alignItems: 'center' }}>
                    <WarningOutlineIcon className="w-4 h-4 text-v-orange-600 flex-shrink-0" />
                    <Text typography="subtitle2" foreground="warning-100">
                        팔레트 검사
                    </Text>
                </HStack>

                {issues.map((check) => (
                    <VStack key={check.id} $css={{ gap: '$050' }}>
                        <Text
                            typography="body3"
                            foreground={check.status === 'fail' ? 'danger-100' : 'warning-100'}
                            className="font-semibold"
                        >
                            {check.status.toUpperCase()} · {check.id}
                        </Text>
                        {check.details.map((detail) => (
                            <Text key={detail} typography="body4" foreground="hint-200">
                                {detail}
                            </Text>
                        ))}
                    </VStack>
                ))}
            </VStack>
        </Box>
    );
};
