import { Box, HStack, Text } from '@vapor-ui/core';
import { ForwardPageOutlineIcon } from '@vapor-ui/icons';

import { isHexColor } from './utils';

type TokenComparisonProps = {
    usedLabel: string;
    suggestedLabel: string;
    leftColor?: string | null;
    rightColor?: string | null;
};

export function TokenComparison({
    usedLabel,
    suggestedLabel,
    leftColor,
    rightColor,
}: TokenComparisonProps) {
    return (
        <HStack
            $css={{
                width: '100%',
                gap: '$150',
                alignItems: 'center',
                color: '$fg-hint-100',
            }}
        >
            <TokenChip label={usedLabel} swatch={leftColor ?? null} tone="used" />
            <ForwardPageOutlineIcon size="20" />
            <TokenChip label={suggestedLabel} swatch={rightColor ?? null} tone="suggested" />
        </HStack>
    );
}

/* -----------------------------------------------------------------------------------------------*/

type TokenChipProps = {
    label: string;
    swatch: string | null;
    tone: 'used' | 'suggested';
};

export function TokenChip({ label, swatch, tone }: TokenChipProps) {
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
            <Text
                typography="body2"
                foreground="normal-200"
                className="min-w-0 flex-1 text-left truncate"
            >
                {label}
            </Text>
        </HStack>
    );
}

/* -----------------------------------------------------------------------------------------------*/

type ColorSwatchProps = {
    value: string | null;
};

export function ColorSwatch({ value }: ColorSwatchProps) {
    if (!value || !isHexColor(value)) return null;

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
                backgroundColor: value,
            }}
        />
    );
}
