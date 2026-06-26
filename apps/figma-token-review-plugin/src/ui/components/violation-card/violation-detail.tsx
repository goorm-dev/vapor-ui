import { Badge, Box, Text, VStack } from '@vapor-ui/core';
import { AiSmartieIcon } from '@vapor-ui/icons';

const PANEL_CSS = {
    width: '100%',
    paddingInline: '$150',
    paddingBlock: '$100',
    borderRadius: '$300',
    backgroundColor: '$bg-canvas-200',
} as const;

type ViolationDetailProps = {
    detail: string;
    hasSuggestion: boolean;
};

export function ViolationDetail({ detail, hasSuggestion }: ViolationDetailProps) {
    if (!hasSuggestion) {
        return (
            <Box $css={PANEL_CSS}>
                <Text typography="body2" foreground="normal-200">
                    {detail}
                </Text>
            </Box>
        );
    }

    return (
        <VStack $css={{ gap: '$100', ...PANEL_CSS }}>
            <Badge size="sm" shape="pill" colorPalette="primary">
                <AiSmartieIcon size="14" />
                AI 추천
            </Badge>
            <Text typography="body2" foreground="normal-200">
                {detail}
            </Text>
        </VStack>
    );
}
