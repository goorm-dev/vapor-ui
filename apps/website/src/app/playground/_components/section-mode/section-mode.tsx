import { RadioCard, RadioCardGroup, useTheme } from '@vapor-ui/core';

import { PanelSectionWrapper } from '../panel-section-wrapper';

const SectionMode = () => {
    const { setTheme, resolvedTheme } = useTheme();

    const handleModeChange = (value: unknown) => {
        const isValidTheme = (v: unknown): v is 'light' | 'dark' =>
            typeof v === 'string' && ['light', 'dark'].includes(v);

        if (isValidTheme(value)) {
            setTheme(value);
        } else {
            console.warn(`Invalid theme value received: ${value}, falling back to 'light'`);
            setTheme('light');
        }
    };

    return (
        <PanelSectionWrapper.Root>
            <PanelSectionWrapper.Title>Color</PanelSectionWrapper.Title>
            <PanelSectionWrapper.Contents>
                <RadioCardGroup.Root
                    key={resolvedTheme}
                    defaultValue={resolvedTheme ?? 'light'}
                    orientation="horizontal"
                    size="md"
                    onValueChange={handleModeChange}
                >
                    <RadioCard.Root value="light">Light</RadioCard.Root>
                    <RadioCard.Root value="dark">Dark</RadioCard.Root>
                </RadioCardGroup.Root>
            </PanelSectionWrapper.Contents>
        </PanelSectionWrapper.Root>
    );
};

export { SectionMode };
