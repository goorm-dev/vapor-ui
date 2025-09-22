import { useState } from 'react';

import { SCALE_VALUES, type ScaleValue, useThemeVariables } from '~/hooks/use-theme-variables';

import RadioButtonGroup from '../radio-button-group';
import Section from '../section';

function Scaling() {
    const [checked, setChecked] = useState<ScaleValue>('1');
    const { setThemeVariable } = useThemeVariables();

    return (
        <Section title="Scaling">
            <RadioButtonGroup
                value={checked}
                onValueChange={(value: ScaleValue) => setChecked(value)}
            >
                {SCALE_VALUES.map((scale) => {
                    return (
                        <RadioButtonGroup.Button
                            data-theme-category="scaling"
                            key={scale}
                            value={scale}
                            stretch
                            color={scale === checked ? 'primary' : 'secondary'}
                            variant="outline"
                            onClick={() => setThemeVariable('scale', scale)}
                        >
                            <span>{scaleToPercent(scale)}</span>
                        </RadioButtonGroup.Button>
                    );
                })}
            </RadioButtonGroup>
        </Section>
    );
}

export default Scaling;

function scaleToPercent(value: string) {
    return `${Math.round(parseFloat(value) * 100)}%`;
}
