import { RadioCard, RadioCardGroup } from '@vapor-ui/core';

import type { RadiusValue } from '~/providers/theme';
import { useCustomTheme } from '~/providers/theme';

import { PanelSectionWrapper } from '../panel-section-wrapper';

const RADIUS_OPTIONS: ReadonlyArray<{ value: RadiusValue; label: string }> = [
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
        const radiusValue = String(value) as RadiusValue;
        applyRadius(radiusValue);
    };

    return (
        <PanelSectionWrapper.Root>
            <PanelSectionWrapper.Title>Border Radius</PanelSectionWrapper.Title>
            <PanelSectionWrapper.Contents>
                <RadioCardGroup.Root
                    defaultValue="md"
                    orientation="horizontal"
                    size="md"
                    onValueChange={handleValueChange}
                >
                    {RADIUS_OPTIONS.map(({ value, label }) => (
                        <RadioCard.Root key={value} value={value}>
                            {label}
                        </RadioCard.Root>
                    ))}
                </RadioCardGroup.Root>
            </PanelSectionWrapper.Contents>
        </PanelSectionWrapper.Root>
    );
};

export { SectionRadius };
