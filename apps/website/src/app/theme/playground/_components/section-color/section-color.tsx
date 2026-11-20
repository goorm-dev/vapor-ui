'use client';

import { useState } from 'react';

import type { ColorThemeConfig } from '@vapor-ui/css-generator';

import { useCustomTheme } from '~/providers/theme';

import { ColorPicker } from '../color-picker';
import { PanelSectionWrapper } from '../panel-section-wrapper';

/* -------------------------------------------------------------------------------------------------
 * ColorPickerSection - Sub Component
 * -----------------------------------------------------------------------------------------------*/
interface ColorPickerSectionProps {
    defaultValue: string;
    onColorChange: (color: string) => void;
}

const ColorPickerSection = ({ defaultValue, onColorChange }: ColorPickerSectionProps) => {
    return (
        <ColorPicker.Root
            width="100%"
            defaultValue={defaultValue}
            onSaturationChange={onColorChange}
            onHueChange={onColorChange}
        >
            <ColorPicker.Saturation height={150} />
            <ColorPicker.Hue />
            <ColorPicker.Input onColorChange={onColorChange} />
        </ColorPicker.Root>
    );
};

/* -------------------------------------------------------------------------------------------------
 * SectionColor - Main Component
 * -----------------------------------------------------------------------------------------------*/
const SectionColor = () => {
    const { currentConfig, applyColors } = useCustomTheme();
    const [primaryColor, setPrimaryColor] = useState(
        currentConfig.colors?.primary.hexcode ?? '#2a72e5',
    );

    const handlePrimaryColorChange = (color: string) => {
        setPrimaryColor(color);

        const colorConfig: ColorThemeConfig = {
            primary: {
                name: 'primary',
                hexcode: color,
            },
        };

        applyColors(colorConfig);
    };

    return (
        <PanelSectionWrapper.Root>
            <PanelSectionWrapper.Title>Color</PanelSectionWrapper.Title>

            <PanelSectionWrapper.SubTitle>Primary Color</PanelSectionWrapper.SubTitle>
            <PanelSectionWrapper.Contents>
                <ColorPickerSection
                    defaultValue={primaryColor}
                    onColorChange={handlePrimaryColorChange}
                />
            </PanelSectionWrapper.Contents>
        </PanelSectionWrapper.Root>
    );
};

export { SectionColor };
