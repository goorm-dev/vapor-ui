import { HStack, RadioCard, RadioGroup, useTheme } from '@vapor-ui/core';

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
            <PanelSectionWrapper.Title>Mode</PanelSectionWrapper.Title>
            <PanelSectionWrapper.Contents>
                <RadioGroup.Root
                    value={resolvedTheme ?? 'light'}
                    size="md"
                    onValueChange={handleModeChange}
                >
                    <HStack gap="$100">
                        <RadioCard value="light">Light</RadioCard>
                        <RadioCard value="dark">Dark</RadioCard>
                    </HStack>
                </RadioGroup.Root>
            </PanelSectionWrapper.Contents>
        </PanelSectionWrapper.Root>
    );
};

export { SectionMode };
