'use client';

import { useCallback, useState } from 'react';

import type { SemanticMappingConfig } from '@vapor-ui/color-generator';
import { Button } from '@vapor-ui/core';
import { generateColorCSS } from '@vapor-ui/css-generator';

import { ColorPicker } from '../color-picker';
import Section from '../section';

const ColorBoard = () => {
    const [primaryColor, setPrimaryColor] = useState('#2a6ff3');
    const [backgroundColor, setBackgroundColor] = useState('#ffffff');

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
                    light: 98,
                    dark: 8,
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
    }, [primaryColor, backgroundColor]);

    return (
        <Section title="Color">
            <ColorPicker
                defaultValue={primaryColor}
                onColorChange={setPrimaryColor}
                width="100%"
                height={150}
            />

            <ColorPicker
                defaultValue={backgroundColor}
                onColorChange={setBackgroundColor}
                width="100%"
                height={150}
            />

            <Button onClick={applyColorsToCSS} className="w-full">
                Apply Colors to Theme
            </Button>
        </Section>
    );
};

export default ColorBoard;
