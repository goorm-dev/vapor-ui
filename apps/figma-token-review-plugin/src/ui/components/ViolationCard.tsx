import { Badge, Box, Card, HStack, Text, VStack } from '@vapor-ui/core';
import { AiSmartieIcon, CaretRightIcon, ForwardPageOutlineIcon } from '@vapor-ui/icons';

import type { Violation } from '~/shared/schema';
import { postToCode } from '~/ui/messaging';

type Props = {
    violation: Violation;
};

const PROPERTY_LABEL: Record<Violation['type'], string> = {
    'token-not-used': 'Fill',
    'unknown-token': 'Fill',
    'do-not-use': 'Fill',
    'role-mismatch': 'Role',
    'fg-grade-mismatch': 'Text',
    'fg-grade-ambiguous': 'Text',
};

const HEX_RE = /#[0-9a-fA-F]{3,8}/;

function extractRawValue(detail: string): string | null {
    const m = detail.match(HEX_RE);
    return m ? m[0].toUpperCase() : null;
}

function ColorSwatch({ value }: { value: string | null }) {
    const isHex = value && HEX_RE.test(value);
    return (
        <Box
            aria-hidden
            $css={{
                width: '$175',
                height: '$175',
                flexShrink: 0,
                borderRadius: '$100',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: '$border-normal',
                ...(isHex ? { backgroundColor: value } : { backgroundColor: '$bg-danger-200' }),
            }}
        />
    );
}

function TokenChip({
    label,
    swatch,
    tone,
}: {
    label: string;
    swatch: string | null;
    tone: 'used' | 'suggested';
}) {
    return (
        <HStack
            $css={{
                flex: '1 0 0',
                minWidth: 0,
                height: '$400',
                alignItems: 'center',
                gap: '$100',
                paddingInline: '$100',
                borderRadius: '$300',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: '$border-normal',
                backgroundColor: tone === 'used' ? '$bg-canvas-200' : '$bg-canvas-100',
            }}
        >
            <ColorSwatch value={swatch} />
            <Text typography="body2" foreground="normal-200" className="min-w-0 flex-1 truncate">
                {label}
            </Text>
        </HStack>
    );
}

export function ViolationCard({ violation }: Props) {
    const property = PROPERTY_LABEL[violation.type];
    const rawValue = extractRawValue(violation.detail);
    const usedLabel = violation.token ?? rawValue ?? '—';
    const suggested = violation.suggested[0];
    const nodes =
        violation.nodeIds && violation.nodeIds.length > 0 ? violation.nodeIds : [violation.nodeId];

    return (
        <Card.Root
            render={<button />}
            onClick={() => postToCode({ type: 'focus', nodeIds: nodes })}
        >
            <Card.Body $css={{ padding: '$200', paddingTop: '$150' }}>
                <VStack $css={{ gap: '$150', width: '100%' }}>
                    <VStack $css={{ gap: '$100', width: '100%', alignItems: 'flex-start' }}>
                        <HStack
                            $css={{
                                width: '100%',
                                gap: '$050',
                                alignItems: 'center',
                                color: '$fg-hint-100',
                            }}
                        >
                            <Text
                                typography="subtitle1"
                                foreground="normal-200"
                                className="shrink truncate"
                            >
                                {violation.name}
                            </Text>
                            <CaretRightIcon className="shrink-0" />
                            <Text
                                typography="subtitle1"
                                foreground="normal-200"
                                className="shrink-0"
                            >
                                {property}
                            </Text>
                        </HStack>
                        <HStack
                            $css={{
                                width: '100%',
                                gap: '$150',
                                alignItems: 'center',
                                color: '$fg-hint-100',
                            }}
                        >
                            <TokenChip label={usedLabel} swatch={rawValue} tone="used" />
                            <ForwardPageOutlineIcon size="20" />
                            <TokenChip
                                label={suggested ?? '추천 없음'}
                                swatch={rawValue}
                                tone="suggested"
                            />
                        </HStack>
                    </VStack>

                    {suggested ? (
                        <VStack
                            $css={{
                                gap: '$100',
                                width: '100%',
                                paddingInline: '$150',
                                paddingBlock: '$100',
                                borderRadius: '$300',
                                backgroundColor: '$bg-canvas-200',
                            }}
                        >
                            <Badge size="sm" shape="pill" colorPalette="primary">
                                <AiSmartieIcon size="14" />
                                AI 추천
                            </Badge>
                            <Text typography="body2" foreground="normal-200">
                                {violation.detail}
                            </Text>
                        </VStack>
                    ) : (
                        <Box
                            $css={{
                                width: '100%',
                                paddingInline: '$150',
                                paddingBlock: '$100',
                                borderRadius: '$300',
                                backgroundColor: '$bg-canvas-200',
                            }}
                        >
                            <Text typography="body2" foreground="normal-200">
                                {violation.detail}
                            </Text>
                        </Box>
                    )}
                </VStack>
            </Card.Body>
        </Card.Root>
    );
}
