import { useState } from 'react';

import { RADIUS_VALUES, type RadiusValue, useThemeVariables } from '~/hooks/use-theme-variables';

import RadioButtonGroup from '../radio-button-group';
import Section from '../section';

function Radius() {
    const [checked, setChecked] = useState<RadiusValue>('md');
    const { setThemeVariable } = useThemeVariables();

    return (
        <Section title="Border Radius">
            <RadioButtonGroup
                value={checked}
                onValueChange={(value: RadiusValue) => setChecked(value)}
            >
                {RADIUS_VALUES.map((r) => {
                    return (
                        <RadioButtonGroup.Button
                            data-theme-category={'border-radius'}
                            key={r}
                            value={r}
                            stretch
                            color={r === checked ? 'primary' : 'secondary'}
                            variant="outline"
                            onClick={() => setThemeVariable('radius', r)}
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
