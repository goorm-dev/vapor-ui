'use client';

import { useState } from 'react';

import type { SemanticMappingConfig } from '@vapor-ui/color-generator';
import { getColorLightness } from '@vapor-ui/color-generator';

import { useCustomTheme } from '~/hooks/use-custom-theme';

import { ColorPicker } from '../color-picker';
import PanelSection from '../panel-section/panel-section';

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
        <PanelSection.Root>
            <PanelSection.Title>Color</PanelSection.Title>
            <PanelSection.SubTitle>Pick Primary Color</PanelSection.SubTitle>
            <PanelSection.Contents>
                <ColorPicker.Root
                    width="100%"
                    defaultValue={primaryColor}
                    onSaturationChange={(color) => {
                        handlePrimaryColorChange(color);
                    }}
                    onHueChange={(color) => {
                        handlePrimaryColorChange(color);
                    }}
                >
                    <ColorPicker.Saturation height={150} />
                    <ColorPicker.Hue />
                    <ColorPicker.Input
                        onColorChange={(color) => {
                            console.log('Input Change:', color);
                        }}
                    />
                </ColorPicker.Root>
            </PanelSection.Contents>

            <PanelSection.SubTitle>Pick Background Color</PanelSection.SubTitle>
            <PanelSection.Contents>
                <ColorPicker.Root
                    width="100%"
                    defaultValue={backgroundColor}
                    onSaturationChange={(color) => {
                        handleBackgroundColorChange(color);
                    }}
                    onHueChange={(color) => {
                        handleBackgroundColorChange(color);
                    }}
                >
                    <ColorPicker.Saturation height={150} />
                    <ColorPicker.Hue />
                    <ColorPicker.Input
                        onColorChange={(color) => {
                            console.log('Input Change:', color);
                        }}
                    />
                </ColorPicker.Root>
            </PanelSection.Contents>
        </PanelSection.Root>
    );
};

export default SectionColor;
