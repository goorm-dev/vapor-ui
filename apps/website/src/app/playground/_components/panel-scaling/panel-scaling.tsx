import { useState } from 'react';

import { useTheme } from '@vapor-ui/core';

import RadioButtonGroup from '../radio-button-group';
import Section from '../section';

const SCALES = ['0.8', '0.9', '1', '1.15', '1.2'] as const;

type Scaling = (typeof SCALES)[number];

function Scaling() {
    const [checked, setChecked] = useState('1');
    const { setTheme } = useTheme();

    return (
        <Section title="Scaling">
            <RadioButtonGroup value={checked} onValueChange={(value: Scaling) => setChecked(value)}>
                {SCALES.map((scale) => {
                    const scaleNumber = parseFloat(scale);
                    return (
                        <RadioButtonGroup.Button
                            data-theme-category="scaling"
                            key={scale}
                            value={scale}
                            stretch
                            color={scale === checked ? 'primary' : 'secondary'}
                            variant="outline"
                            onClick={() =>
                                setTheme({
                                    scaling: scaleNumber,
                                })
                            }
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
