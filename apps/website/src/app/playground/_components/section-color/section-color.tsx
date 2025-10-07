'use client';

import { useState } from 'react';

import type { SemanticMappingConfig } from '@vapor-ui/color-generator';
import { getColorLightness } from '@vapor-ui/color-generator';

import { useCustomTheme } from '~/providers/theme';

import { ColorPicker } from '../color-picker';
import { PanelSectionWrapper } from '../panel-section-wrapper';

const SectionColor = () => {
    const [primaryColor, setPrimaryColor] = useState('#3174dc');
    const [backgroundColor, setBackgroundColor] = useState('#ffffff');
    const [backgroundLightness, setBackgroundLightness] = useState(100);

    const { applyColors } = useCustomTheme();

    const applyColorsToCSS = ({
        selectedPrimary = primaryColor,
        selectedBackground = backgroundColor,
        selectedLightness = backgroundLightness,
    }) => {
        const colorConfig: SemanticMappingConfig = {
            primary: {
                name: 'primary',
                color: selectedPrimary,
            },
            background: {
                name: 'neutral',
                color: selectedBackground,
                lightness: {
                    light: selectedLightness,
                    dark: 0,
                },
            },
        };
        applyColors(colorConfig);
    };

    const handlePrimaryColorChange = (color: string) => {
        setPrimaryColor(color);
        applyColorsToCSS({ selectedPrimary: color });
    };

    const handleBackgroundColorChange = (color: string) => {
        setBackgroundColor(color);
        const lightness = getColorLightness(color);
        if (lightness !== null) {
            setBackgroundLightness(lightness);
        }

        applyColorsToCSS({ selectedBackground: color, selectedLightness: lightness ?? 100 });
    };

    return (
        <PanelSectionWrapper.Root>
            <PanelSectionWrapper.Title>Color</PanelSectionWrapper.Title>
            <PanelSectionWrapper.SubTitle>Pick Primary Color</PanelSectionWrapper.SubTitle>
            <PanelSectionWrapper.Contents>
                <ColorPicker.Root
                    width="100%"
                    defaultValue={primaryColor}
                    onSaturationChange={handlePrimaryColorChange}
                    onHueChange={handlePrimaryColorChange}
                >
                    <ColorPicker.Saturation height={150} />
                    <ColorPicker.Hue />
                    <ColorPicker.Input onColorChange={handlePrimaryColorChange} />
                </ColorPicker.Root>
            </PanelSectionWrapper.Contents>

            <PanelSectionWrapper.SubTitle>Pick Background Color</PanelSectionWrapper.SubTitle>
            <PanelSectionWrapper.Contents>
                <ColorPicker.Root
                    width="100%"
                    defaultValue={backgroundColor}
                    onSaturationChange={handleBackgroundColorChange}
                    onHueChange={handleBackgroundColorChange}
                >
                    <ColorPicker.Saturation height={150} />
                    <ColorPicker.Hue />
                    <ColorPicker.Input onColorChange={handleBackgroundColorChange} />
                </ColorPicker.Root>
            </PanelSectionWrapper.Contents>
        </PanelSectionWrapper.Root>
    );
};

export { SectionColor };
