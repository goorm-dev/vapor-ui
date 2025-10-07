import { RadioCard, RadioCardGroup } from '@vapor-ui/core';

import type { RadiusValue } from '~/hooks/use-custom-theme';
import { useCustomTheme } from '~/hooks/use-custom-theme';

import { PanelSectionWrapper } from '../panel-section-wrapper';

const SectionRadius = () => {
    const { applyRadius } = useCustomTheme();

    const handleValueChange = (value: unknown) => {
        console.log('Selected radius value:', value);
        applyRadius(value as RadiusValue);
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
                    <RadioCard.Root value="none">none</RadioCard.Root>
                    <RadioCard.Root value="sm">sm</RadioCard.Root>
                    <RadioCard.Root value="md">md</RadioCard.Root>
                    <RadioCard.Root value="lg">lg</RadioCard.Root>
                    <RadioCard.Root value="xl">xl</RadioCard.Root>
                    <RadioCard.Root value="full">full</RadioCard.Root>
                </RadioCardGroup.Root>
            </PanelSectionWrapper.Contents>
        </PanelSectionWrapper.Root>
    );
};

export { SectionRadius };
