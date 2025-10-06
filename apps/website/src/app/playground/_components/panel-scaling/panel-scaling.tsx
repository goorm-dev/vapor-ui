import { useState } from 'react';

import { SCALE_VALUES, type ScaleValue, useCustomTheme } from '~/hooks/use-custom-theme';

import { CUSTOM_THEME_DATA_ATTRIBUTES } from '../../_constants';
import RadioButtonGroup from '../radio-button-group';
import Section from '../section';

function Scaling() {
    const [checked, setChecked] = useState<ScaleValue>('1');
    const { applyScaling } = useCustomTheme({ scope: `[${CUSTOM_THEME_DATA_ATTRIBUTES}]` });

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
                            onClick={() => applyScaling(parseFloat(scale))}
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
