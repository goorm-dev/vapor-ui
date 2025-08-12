import { useState } from 'react';

import { useTheme } from '@vapor-ui/core';

import RadioButtonGroup from '../radio-button-group';
import Section from '../section';

const radius = ['none', 'sm', 'md', 'lg', 'xl', 'full'] as const;

type Radius = (typeof radius)[number];

function Radius() {
    const [checked, setChecked] = useState<Radius>('md');
    const { setTheme } = useTheme();

    return (
        <Section title="Border Radius">
            <RadioButtonGroup value={checked} onValueChange={(value: Radius) => setChecked(value)}>
                {radius.map((r) => {
                    return (
                        <RadioButtonGroup.Button
                            data-theme-category={'border-radius'}
                            key={r}
                            value={r}
                            stretch
                            color={r === checked ? 'primary' : 'secondary'}
                            variant="outline"
                            onClick={() => setTheme({ radius: r })}
                        >
                            <span>{r}</span>
                        </RadioButtonGroup.Button>
                    );
                })}
            </RadioButtonGroup>
        </Section>
    );
}

export default Radius;
