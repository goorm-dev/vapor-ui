import { Radio, RadioGroup } from '@base-ui-components/react';
import { Button } from '@vapor-ui/core';

import { PanelSectionWrapper } from '../panel-section-wrapper';

const MODES = [
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
];
const SectionMode = () => {
    return (
        <PanelSectionWrapper.Root>
            <PanelSectionWrapper.Title>Color</PanelSectionWrapper.Title>
            <PanelSectionWrapper.Contents>
                <label>
                    <Radio.Root value="fuji-apple">
                        <Radio.Indicator />
                    </Radio.Root>
                    Fuji
                </label>
            </PanelSectionWrapper.Contents>
        </PanelSectionWrapper.Root>
    );
};

export { SectionMode };
