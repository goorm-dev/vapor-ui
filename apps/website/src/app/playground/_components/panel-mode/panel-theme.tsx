import { useTheme } from '@vapor-ui/core';
import type { IconType } from '@vapor-ui/icons';
import { DarkIcon, LightIcon } from '@vapor-ui/icons';

import RadioButtonGroup from '../radio-button-group';
import Section from '../section';

type Theme = 'light' | 'dark';

const THEME_CONFIG = {
    light: {
        icon: LightIcon,
        label: 'Light',
    },
    dark: {
        icon: DarkIcon,
        label: 'Dark',
    },
} satisfies Record<Theme, { icon: IconType; label: string }>;

function Theme() {
    const { setTheme, theme } = useTheme();

    const handleThemeChange = (selectedTheme: Theme) => {
        setTheme(selectedTheme);
    };

    return (
        <Section title="Theme">
            <RadioButtonGroup value={theme} onValueChange={handleThemeChange}>
                {(Object.keys(THEME_CONFIG) as Theme[]).map((themeKey) => {
                    const { icon: Icon, label } = THEME_CONFIG[themeKey];
                    return (
                        <RadioButtonGroup.Button
                            data-theme-category="mode"
                            key={themeKey}
                            value={themeKey}
                            color={themeKey === theme ? 'primary' : 'secondary'}
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

export default Theme;
