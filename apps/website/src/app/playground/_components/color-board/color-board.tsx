'use client';

import { useCallback, useState } from 'react';

import type { SemanticMappingConfig } from '@vapor-ui/color-generator';
import { getColorLightness } from '@vapor-ui/color-generator';
import { Text } from '@vapor-ui/core';
import { generateColorCSS } from '@vapor-ui/css-generator';

import { ColorPicker } from '../color-picker';
import Section from '../section';

const ColorBoard = () => {
    const [primaryColor, setPrimaryColor] = useState('#2a6ff3');
    const [backgroundColor, setBackgroundColor] = useState('#ffffff');
    const [backgroundLightness, setBackgroundLightness] = useState(100);

    const applyColorsToCSS = useCallback(() => {
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

        const generatedCSS = generateColorCSS(colorConfig);

        const existingStyle = document.getElementById('vapor-dynamic-theme');
        if (existingStyle) {
            existingStyle.remove();
        }

        const styleElement = document.createElement('style');
        styleElement.id = 'vapor-dynamic-theme';
        styleElement.textContent = generatedCSS;
        document.head.appendChild(styleElement);
    }, [primaryColor, backgroundColor, backgroundLightness]);

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
                    <Text typography="body3" foreground="secondary">
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
                    <Text typography="body3" foreground="secondary">
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
