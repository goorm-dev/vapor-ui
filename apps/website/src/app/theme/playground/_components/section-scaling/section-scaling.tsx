import { HStack, RadioCard, RadioGroup } from '@vapor-ui/core';

import { SCALE_VALUES, useCustomTheme } from '~/providers/theme';

import { PanelSectionWrapper } from '../panel-section-wrapper';

const SCALE_OPTIONS = SCALE_VALUES.map((value) => ({
    value,
    label: `${(value * 100).toFixed(0)}%`,
}));

const SectionScaling = () => {
    const { applyScaling } = useCustomTheme();

    const handleValueChange = (value: unknown) => {
        const numericValue = Number(value);

        if (!Number.isNaN(numericValue)) {
            applyScaling(numericValue);
        }
    };

    return (
        <PanelSectionWrapper.Root>
            <PanelSectionWrapper.Title>Scaling</PanelSectionWrapper.Title>
            <PanelSectionWrapper.Contents>
                <RadioGroup.Root defaultValue="1" size="md" onValueChange={handleValueChange}>
                    <HStack $styles={{ gap: '$100' }}>
                        {SCALE_OPTIONS.map(({ value, label }) => (
                            <RadioCard key={value} value={String(value)}>
                                {label}
                            </RadioCard>
                        ))}
                    </HStack>
                </RadioGroup.Root>
            </PanelSectionWrapper.Contents>
        </PanelSectionWrapper.Root>
    );
};

export { SectionScaling };
