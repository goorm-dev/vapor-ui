import type { Box } from '@vapor-ui/core';
import { Badge, HStack, Text, VStack } from '@vapor-ui/core';
import { AiSmartieIcon, WarningIcon } from '@vapor-ui/icons';

import type { Confidence, Severity } from '~/common/schemas';

type ViolationDetailProps = {
    message: string;
    severity: Severity;
    confidence?: Confidence;
};

export function ViolationDetail({ message, severity, confidence }: ViolationDetailProps) {
    const severityMap = SEVERITY_MAP[severity];
    const confidenceMap = confidence ? CONFIDENCE_MAP[confidence] : null;

    return (
        <DescriptionBox $css={{ gap: '$100', alignItems: 'flex-start', paddingTop: '$150' }}>
            <HStack $css={{ gap: '$075', alignItems: 'center', flexWrap: 'wrap' }}>
                <Badge size="sm" shape="pill" colorPalette={severityMap.palette}>
                    <WarningIcon size="14" />
                    {severityMap.label}
                </Badge>
                {confidenceMap && (
                    <Badge size="sm" shape="pill" colorPalette={confidenceMap.palette}>
                        <AiSmartieIcon size="14" />
                        AI 추천: {confidenceMap.label}
                    </Badge>
                )}
            </HStack>
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

/* -----------------------------------------------------------------------------------------------*/

type Value = { label: string; palette: Badge.Props['colorPalette'] };

const SEVERITY_MAP: Record<string, Value> = {
    high: { label: '심각', palette: 'danger' },
    info: { label: '참고', palette: 'warning' },
};

const CONFIDENCE_MAP: Record<string, Value> = {
    HIGH: { label: '확신 높음', palette: 'success' },
    MED: { label: '확신 보통', palette: 'warning' },
    LOW: { label: '확신 낮음', palette: 'hint' },
};
