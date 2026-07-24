import { Card, VStack } from '@vapor-ui/core';

import type { SchemaMode, Violation } from '~/common/schemas';
import { requestFocus } from '~/ui/features/messaging';
import { loadColorSchema } from '~/ui/lib/loaders/color';

import { TokenComparison } from './token-comparison';
import { ViolationBreadcrumb } from './violation-breadcrumb';
import { ViolationDetail } from './violation-detail';

const PROPERTY_LABEL: Record<Violation['property'], string> = {
    fill: 'Fill',
    'fill-on-text': 'Text Fill',
    stroke: 'Stroke',
    padding: 'Padding',
    paddingTop: 'Padding Top',
    paddingRight: 'Padding Right',
    paddingBottom: 'Padding Bottom',
    paddingLeft: 'Padding Left',
    paddingVertical: 'Padding Vertical',
    paddingHorizontal: 'Padding Horizontal',
    gap: 'Gap',
    width: 'Width',
    height: 'Height',
    borderRadius: 'Border Radius',
    shadow: 'Shadow',
    textStyle: 'Text Style',
};

const COLOR_PROPERTIES: ReadonlySet<Violation['property']> = new Set([
    'fill',
    'fill-on-text',
    'stroke',
]);

function isColorProperty(p: Violation['property']): boolean {
    return COLOR_PROPERTIES.has(p);
}

/** Resolve a token or raw hex to a hex string for the swatch. */
function resolveHex(tokenOrHex: string | null, schemaMode: SchemaMode): string | null {
    if (!tokenOrHex) return null;
    if (/^#[0-9a-fA-F]{3,8}$/.test(tokenOrHex)) return tokenOrHex;
    const schema = loadColorSchema(schemaMode);
    const sem = schema.semantic[tokenOrHex];
    if (sem?.hex) return sem.hex;
    const prim = schema.primitive[tokenOrHex];
    return prim ?? null;
}

type ViolationCardProps = {
    violation: Violation;
    schemaMode: SchemaMode;
};

export function ViolationCard({ violation, schemaMode }: ViolationCardProps) {
    const property = PROPERTY_LABEL[violation.property];
    const usedLabel = violation.token ?? violation.value ?? '—';
    const suggested = violation.suggested[0] ?? null;
    const suggestedLabel = suggested ?? '추천 없음';
    const nodes =
        violation.nodeIds && violation.nodeIds.length > 0 ? violation.nodeIds : [violation.nodeId];

    const isColor = isColorProperty(violation.property);
    const leftColor = isColor ? resolveHex(violation.token ?? violation.value, schemaMode) : null;
    const rightColor = isColor && suggested ? resolveHex(suggested, schemaMode) : null;

    return (
        <Card.Root render={<button />} onClick={() => requestFocus(nodes)}>
            <Card.Body $css={{ padding: '$200', paddingTop: '$150' }}>
                <VStack $css={{ gap: '$150', width: '100%' }}>
                    <VStack $css={{ gap: '$100', width: '100%', alignItems: 'flex-start' }}>
                        <ViolationBreadcrumb name={violation.name} property={property} />
                        <TokenComparison
                            usedLabel={usedLabel}
                            suggestedLabel={suggestedLabel}
                            leftColor={leftColor}
                            rightColor={rightColor}
                        />
                    </VStack>

                    <ViolationDetail
                        message={violation.message}
                        severity={violation.severity}
                        confidence={violation.confidence}
                    />
                </VStack>
            </Card.Body>
        </Card.Root>
    );
}
