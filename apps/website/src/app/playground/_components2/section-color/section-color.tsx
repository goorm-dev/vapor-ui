'use client';

import { useState } from 'react';

import type { SemanticMappingConfig } from '@vapor-ui/color-generator';
import { getColorLightness } from '@vapor-ui/color-generator';

import { useCustomTheme } from '~/hooks/use-custom-theme';

import { ColorPicker } from '../color-picker';
import { PanelSectionWrapper } from '../panel-section-wrapper';

const SectionColor = () => {
    const [primaryColor, setPrimaryColor] = useState('#2a6ff3');
    const [backgroundColor, setBackgroundColor] = useState('#ffffff');
    const [backgroundLightness, setBackgroundLightness] = useState(100);

    const { applyColors } = useCustomTheme({ scope: '[data-playground-scope]' });

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

    const onPrimaryColorChange = (color: string) => {
        setPrimaryColor(color);
        applyColorsToCSS({ selectedPrimary: color });
    };

    const onBackgroundColorChange = (color: string) => {
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
                    onSaturationChange={onPrimaryColorChange}
                    onHueChange={onPrimaryColorChange}
                >
                    <ColorPicker.Saturation height={150} />
                    <ColorPicker.Hue />
                    <ColorPicker.Input onColorChange={onPrimaryColorChange} />
                </ColorPicker.Root>
            </PanelSectionWrapper.Contents>

            <PanelSectionWrapper.SubTitle>Pick Background Color</PanelSectionWrapper.SubTitle>
            <PanelSectionWrapper.Contents>
                <ColorPicker.Root
                    width="100%"
                    defaultValue={backgroundColor}
                    onSaturationChange={onBackgroundColorChange}
                    onHueChange={onBackgroundColorChange}
                >
                    <ColorPicker.Saturation height={150} />
                    <ColorPicker.Hue />
                    <ColorPicker.Input onColorChange={onBackgroundColorChange} />
                </ColorPicker.Root>
            </PanelSectionWrapper.Contents>
        </PanelSectionWrapper.Root>
    );
};

export { SectionColor };
