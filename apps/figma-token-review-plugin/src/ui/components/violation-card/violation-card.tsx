import { Badge, Card, HStack, Text, VStack } from '@vapor-ui/core';

import type { Violation } from '~/common/schemas';
import { requestFocus } from '~/ui/features/messaging';

import { TokenComparison } from './token-comparison';
import { extractRawValue } from './utils';
import { ViolationBreadcrumb } from './violation-breadcrumb';
import { ViolationDetail } from './violation-detail';

const PROPERTY_LABEL: Record<Violation['type'], string> = {
    'token-not-used': 'Fill',
    'primitive-used': 'Fill',
    'unknown-token': 'Fill',
    'do-not-use': 'Fill',
    'role-mismatch': 'Role',
    'fg-grade-mismatch': 'Text',
    'fg-grade-ambiguous': 'Text',
    'typo-raw': 'Typography',
    'typo-styled-override': 'Typography',
    'semantic-misfit': 'Fill',
    'typo-hierarchy': 'Typography',
};

type ViolationCardProps = {
    violation: Violation;
};

export function ViolationCard({ violation }: ViolationCardProps) {
    const property = PROPERTY_LABEL[violation.type];
    const rawValue = extractRawValue(violation.detail);
    const usedLabel = violation.token ?? rawValue ?? '—';
    const suggested = violation.suggested[0];
    const nodes =
        violation.nodeIds && violation.nodeIds.length > 0 ? violation.nodeIds : [violation.nodeId];

    return (
        <Card.Root render={<button />} onClick={() => requestFocus(nodes)}>
            <Card.Body $css={{ padding: '$200', paddingTop: '$150' }}>
                <VStack $css={{ gap: '$150', width: '100%' }}>
                    <VStack $css={{ gap: '$100', width: '100%', alignItems: 'flex-start' }}>
                        <ViolationBreadcrumb name={violation.name} property={property} />
                        {violation.heuristic ? (
                            <HStack $css={{ gap: '$050', alignItems: 'center' }}>
                                <Badge size="sm" colorPalette="warning">
                                    의미 판정
                                </Badge>
                                <Badge
                                    size="sm"
                                    colorPalette={
                                        violation.confidence === 'HIGH' ? 'primary' : 'hint'
                                    }
                                >
                                    {violation.confidence ?? 'MED'}
                                </Badge>
                            </HStack>
                        ) : null}
                        <TokenComparison
                            usedLabel={usedLabel}
                            suggestedLabel={suggested ?? '추천 없음'}
                            swatch={rawValue}
                        />
                    </VStack>
                    {violation.heuristic && violation.reasoning ? (
                        <Text typography="body4" foreground="hint-100">
                            {violation.reasoning}
                        </Text>
                    ) : (
                        <ViolationDetail
                            detail={violation.detail}
                            hasSuggestion={Boolean(suggested)}
                        />
                    )}
                </VStack>
            </Card.Body>
        </Card.Root>
    );
}
