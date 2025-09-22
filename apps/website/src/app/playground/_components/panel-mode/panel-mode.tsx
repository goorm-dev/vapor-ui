import { useTheme } from '@vapor-ui/core';
import type { IconType } from '@vapor-ui/icons';
import { DarkIcon, LightIcon } from '@vapor-ui/icons';

import RadioButtonGroup from '../radio-button-group';
import Section from '../section';

type Appearance = 'light' | 'dark';

const APPEARANCE_CONFIG = {
    light: {
        icon: LightIcon,
        label: 'Light',
    },
    dark: {
        icon: DarkIcon,
        label: 'Dark',
    },
} satisfies Record<Appearance, { icon: IconType; label: string }>;

function Mode() {
    const { setTheme, theme } = useTheme();

    const handleAppearanceChange = (selectedTheme: Appearance) => {
        setTheme(selectedTheme);
    };

    return (
        <Section title="Appearance">
            <RadioButtonGroup value={theme} onValueChange={handleAppearanceChange}>
                {(Object.keys(APPEARANCE_CONFIG) as Appearance[]).map((appearanceKey) => {
                    const { icon: Icon, label } = APPEARANCE_CONFIG[appearanceKey];
                    return (
                        <RadioButtonGroup.Button
                            data-theme-category="mode"
                            key={appearanceKey}
                            value={appearanceKey}
                            color={appearanceKey === theme ? 'primary' : 'secondary'}
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

export default Mode;
