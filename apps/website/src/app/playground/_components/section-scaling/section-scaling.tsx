import { RadioCard, RadioCardGroup } from '@vapor-ui/radio-card';

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
