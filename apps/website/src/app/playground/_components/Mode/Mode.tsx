import { useState } from 'react';

import { type Appearance, useTheme } from '@vapor-ui/core';
import type { IconType } from '@vapor-ui/icons';
import { DarkIcon, LightIcon } from '@vapor-ui/icons';

import RadioButtonGroup from '../radio-button-group';
import Section from '../section';

const APPEARANCES = ['light', 'dark'] as const satisfies readonly Appearance[];

const APPEARANCE_CONFIG = {
    light: {
        icon: LightIcon,
        label: 'Light',
    },
    dark: {
        icon: DarkIcon,
        label: 'Dark',
    },
} as const satisfies Record<Appearance, { icon: IconType; label: string }>;

interface ModeProps {
    defaultAppearance?: Appearance;
}

function Mode({ defaultAppearance = 'light' }: ModeProps = {}) {
    const [selectedAppearance, setSelectedAppearance] = useState<Appearance>(defaultAppearance);
    const { setTheme } = useTheme();

    const handleAppearanceChange = (appearance: string) => {
        if (isAppearance(appearance)) {
            setSelectedAppearance(appearance);
            setTheme({ appearance });
        }
    };

    return (
        <Section title="Appearance">
            <RadioButtonGroup value={selectedAppearance} onValueChange={handleAppearanceChange}>
                {APPEARANCES.map((appearance) => {
                    const { icon: Icon, label } = APPEARANCE_CONFIG[appearance];

                    return (
                        <RadioButtonGroup.Button
                            data-theme-category="mode"
                            key={appearance}
                            value={appearance}
                            color={appearance === selectedAppearance ? 'primary' : 'secondary'}
                        >
                            <Icon />
                            <span>{label}</span>
                        </RadioButtonGroup.Button>
                    );
                })}
            </RadioButtonGroup>
        </Section>
    );
}

function isAppearance(value: string): value is Appearance {
    return (APPEARANCES as readonly string[]).includes(value);
}

export default Mode;
