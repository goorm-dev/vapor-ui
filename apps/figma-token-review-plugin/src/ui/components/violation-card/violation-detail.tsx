import type { Box } from '@vapor-ui/core';
import { Badge, Text, VStack } from '@vapor-ui/core';
import { AiSmartieIcon } from '@vapor-ui/icons';

type ViolationDetailProps = {
    message: string;
    hasSuggestion: boolean;
};

export function ViolationDetail({ message, hasSuggestion }: ViolationDetailProps) {
    if (!hasSuggestion) {
        return (
            <DescriptionBox>
                <Text typography="body2" foreground="normal-200" $css={{ textAlign: 'left' }}>
                    {message}
                </Text>
            </DescriptionBox>
        );
    }

    return (
        <DescriptionBox $css={{ gap: '$100', alignItems: 'flex-start', paddingTop: '$150' }}>
            <Badge size="sm" shape="pill" colorPalette="primary">
                <AiSmartieIcon size="14" />
                AI 추천
            </Badge>
            <Text typography="body2" foreground="normal-200" $css={{ textAlign: 'left' }}>
                {message}
            </Text>
        </DescriptionBox>
    );
}

/* -----------------------------------------------------------------------------------------------*/

const DescriptionBox = ({ $css, children, ...props }: Box.Props) => (
    <VStack
        $css={{
            paddingInline: '$150',
            paddingBlock: '$100',
            borderRadius: '$300',
            backgroundColor: '$bg-canvas-200',
            ...$css,
        }}
        {...props}
    >
        {children}
    </VStack>
);
