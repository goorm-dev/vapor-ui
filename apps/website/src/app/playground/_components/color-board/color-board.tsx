'use client';

import { useState } from 'react';

import type { SemanticMappingConfig } from '@vapor-ui/color-generator';
import { getColorLightness } from '@vapor-ui/color-generator';
import { Text } from '@vapor-ui/core';

import { useCustomTheme } from '~/hooks/use-custom-theme';

import { ColorPicker } from '../color-picker';
import Section from '../section';

const ColorBoard = () => {
    const [primaryColor, setPrimaryColor] = useState('#2a6ff3');
    const [backgroundColor, setBackgroundColor] = useState('#ffffff');
    const [backgroundLightness, setBackgroundLightness] = useState(100);

    const { applyColors } = useCustomTheme({ scope: '[data-playground-scope]' });

    const applyColorsToCSS = () => {
        const colorConfig: SemanticMappingConfig = {
            primary: {
                name: 'primary',
                color: primaryColor,
            },
            background: {
                name: 'neutral',
                color: backgroundColor,
                lightness: {
                    light: backgroundLightness,
                    dark: 0,
                },
            },
        };
        applyColors(colorConfig);
    };

    const handleBackgroundColorChange = (color: string) => {
        setBackgroundColor(color);
        const lightness = getColorLightness(color);
        if (lightness !== null) {
            setBackgroundLightness(lightness);
        }
    };

    return (
        <Section title="Color">
            <div className="flex flex-col gap-v-100">
                <div>
                    <Text typography="body3" foreground="secondary-100">
                        Primary Color
                    </Text>
                    <ColorPicker
                        defaultValue={primaryColor}
                        onColorChange={setPrimaryColor}
                        onClickApply={applyColorsToCSS}
                        width="100%"
                        height={150}
                    />
                </div>

                <div>
                    <Text typography="body3" foreground="secondary-100">
                        Background Color
                    </Text>

                    <ColorPicker
                        defaultValue={backgroundColor}
                        onColorChange={handleBackgroundColorChange}
                        onClickApply={applyColorsToCSS}
                        width="100%"
                        height={150}
                    />
                </div>
            </div>
        </Section>
    );
};

export default ColorBoard;
