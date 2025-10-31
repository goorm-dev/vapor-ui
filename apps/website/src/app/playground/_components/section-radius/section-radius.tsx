import { HStack, RadioCard, RadioGroup } from '@vapor-ui/core';
import type { RadiusKey } from '@vapor-ui/css-generator';

import { useCustomTheme } from '~/providers/theme';

import { PanelSectionWrapper } from '../panel-section-wrapper';

const RADIUS_OPTIONS: ReadonlyArray<{ value: RadiusKey; label: string }> = [
    { value: 'none', label: 'none' },
    { value: 'sm', label: 'sm' },
    { value: 'md', label: 'md' },
    { value: 'lg', label: 'lg' },
    { value: 'xl', label: 'xl' },
    { value: 'full', label: 'full' },
] as const;

const SectionRadius = () => {
    const { applyRadius } = useCustomTheme();

    const handleValueChange = (value: unknown) => {
        const radiusValue = String(value) as RadiusKey;
        applyRadius(radiusValue);
    };

    return (
        <PanelSectionWrapper.Root>
            <PanelSectionWrapper.Title>Border Radius</PanelSectionWrapper.Title>
            <PanelSectionWrapper.Contents>
                <RadioGroup.Root defaultValue="md" size="md" onValueChange={handleValueChange}>
                    <HStack gap="$100">
                        {RADIUS_OPTIONS.map(({ value, label }) => (
                            <RadioCard key={value} value={value}>
                                {label}
                            </RadioCard>
                        ))}
                    </HStack>
                </RadioGroup.Root>
            </PanelSectionWrapper.Contents>
        </PanelSectionWrapper.Root>
    );
};

export { SectionRadius };
