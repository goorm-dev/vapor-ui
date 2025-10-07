import { RadioCard, RadioCardGroup } from '@vapor-ui/core';

import { useCustomThemeContext } from '~/hooks/use-custom-theme';

import { PanelSectionWrapper } from '../panel-section-wrapper';

const SCALE_OPTIONS = [
    { value: 0.8, label: '80%' },
    { value: 0.9, label: '90%' },
    { value: 1, label: '100%' },
    { value: 1.2, label: '120%' },
    { value: 1.5, label: '150%' },
] as const;

const SectionScaling = () => {
    const { applyScaling } = useCustomThemeContext();

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
                <RadioCardGroup.Root
                    defaultValue="1"
                    orientation="horizontal"
                    size="md"
                    onValueChange={handleValueChange}
                >
                    {SCALE_OPTIONS.map(({ value, label }) => (
                        <RadioCard.Root key={value} value={String(value)}>
                            {label}
                        </RadioCard.Root>
                    ))}
                </RadioCardGroup.Root>
            </PanelSectionWrapper.Contents>
        </PanelSectionWrapper.Root>
    );
};

export { SectionScaling };
