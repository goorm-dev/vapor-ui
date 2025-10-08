'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';

import { Slider } from '@base-ui-components/react/slider';
import type { SemanticMappingConfig } from '@vapor-ui/color-generator';
import { getColorLightness } from '@vapor-ui/color-generator';
import { DarkIcon, LightIcon } from '@vapor-ui/icons';

import { useCustomTheme } from '~/providers/theme';

import { ColorPicker } from '../color-picker';
import { PanelSectionWrapper } from '../panel-section-wrapper';

/* -------------------------------------------------------------------------------------------------
 * LightnessSlider - Sub Component
 * -----------------------------------------------------------------------------------------------*/
interface LightnessSliderProps {
    icon: ReactNode;
    value: number;
    onValueChange: (value: number) => void;
    ariaLabel: string;
}

const LightnessSlider = ({ icon, value, onValueChange, ariaLabel }: LightnessSliderProps) => {
    return (
        <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-5 h-5">{icon}</div>
                <span className="text-sm font-medium">{value}%</span>
            </div>
            <Slider.Root
                value={value}
                onValueChange={onValueChange}
                min={0}
                max={100}
                aria-label={ariaLabel}
            >
                <Slider.Control className="box-border flex items-center w-full py-3 touch-none select-none">
                    <Slider.Track className="w-full h-1 bg-gray-200 rounded shadow-[inset_0_0_0_1px_rgb(229_231_235)] select-none">
                        <Slider.Indicator className="rounded bg-v-primary-200 select-none" />
                        <Slider.Thumb className="w-4 h-4 rounded-full bg-v-primary-200 outline outline-1 outline-gray-300 select-none focus-visible:outline-2 focus-visible:outline-blue-500" />
                    </Slider.Track>
                </Slider.Control>
            </Slider.Root>
        </div>
    );
};

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
    const [primaryColor, setPrimaryColor] = useState('#3174dc');
    const [backgroundColor, setBackgroundColor] = useState('#ffffff');
    const [backgroundLightness, setBackgroundLightness] = useState(100);
    const [darkBackgroundLightness, setDarkBackgroundLightness] = useState(14);

    const { applyColors } = useCustomTheme();

    const applyColorsToCSS = ({
        selectedPrimary = primaryColor,
        selectedBackground = backgroundColor,
        selectedLightness = backgroundLightness,
        selectedDarkLightness = darkBackgroundLightness,
    }: {
        selectedPrimary?: string;
        selectedBackground?: string;
        selectedLightness?: number;
        selectedDarkLightness?: number;
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
                    dark: selectedDarkLightness,
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

    const handleLightLightnessChange = (value: number) => {
        const lightness = Math.min(100, Math.max(0, value));
        setBackgroundLightness(lightness);
        applyColorsToCSS({ selectedLightness: lightness });
    };

    const handleDarkLightnessChange = (value: number) => {
        const lightness = Math.min(100, Math.max(0, value));
        setDarkBackgroundLightness(lightness);
        applyColorsToCSS({ selectedDarkLightness: lightness });
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

            <PanelSectionWrapper.SubTitle>Background Color</PanelSectionWrapper.SubTitle>
            <PanelSectionWrapper.Contents>
                <ColorPickerSection
                    defaultValue={backgroundColor}
                    onColorChange={handleBackgroundColorChange}
                />
            </PanelSectionWrapper.Contents>

            <PanelSectionWrapper.SubTitle>Background Lightness</PanelSectionWrapper.SubTitle>
            <PanelSectionWrapper.Contents>
                <div className="flex gap-4">
                    <LightnessSlider
                        icon={<LightIcon />}
                        value={backgroundLightness}
                        onValueChange={handleLightLightnessChange}
                        ariaLabel="Light mode background lightness"
                    />
                    <LightnessSlider
                        icon={<DarkIcon />}
                        value={darkBackgroundLightness}
                        onValueChange={handleDarkLightnessChange}
                        ariaLabel="Dark mode background lightness"
                    />
                </div>
            </PanelSectionWrapper.Contents>
        </PanelSectionWrapper.Root>
    );
};

export { SectionColor };
