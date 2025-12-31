'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';

import { Slider } from '@base-ui/react/slider';
import { getColorLightness } from '@vapor-ui/color-generator';
import type { ColorThemeConfig } from '@vapor-ui/css-generator';
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
    onValueCommitted?: (value: number) => void;
    ariaLabel: string;
    min?: number;
    max?: number;
}

const LightnessSlider = ({
    icon,
    value,
    onValueChange,
    onValueCommitted,
    ariaLabel,
    min = 0,
    max = 100,
}: LightnessSliderProps) => {
    return (
        <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-5 h-5">{icon}</div>
                <span className="text-sm font-medium">{value}%</span>
            </div>
            <Slider.Root
                value={value}
                onValueChange={onValueChange}
                onValueCommitted={onValueCommitted}
                min={min}
                max={max}
            >
                <Slider.Control className="box-border flex items-center w-full py-3 touch-none select-none">
                    <Slider.Track className="w-full h-1 bg-gray-200 rounded shadow-[inset_0_0_0_1px_rgb(229_231_235)] select-none">
                        <Slider.Indicator className="rounded bg-v-primary-200 select-none" />
                        <Slider.Thumb aria-label={ariaLabel} className="w-4 h-4 rounded-full bg-v-primary-200 outline outline-1 outline-gray-300 select-none has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-blue-500" />
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
    const { currentConfig, applyColors } = useCustomTheme();
    const [primaryColor, setPrimaryColor] = useState(
        currentConfig.colors?.primary.hexcode ?? '#2a72e5',
    );
    const [backgroundColor, setBackgroundColor] = useState(
        currentConfig.colors?.background.hexcode ?? '#ffffff',
    );
    const [backgroundLightness, setBackgroundLightness] = useState(
        currentConfig.colors?.background.lightness?.light ?? 100,
    );
    const [darkBackgroundLightness, setDarkBackgroundLightness] = useState(
        currentConfig.colors?.background.lightness?.dark ?? 14,
    );

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
        const colorConfig: ColorThemeConfig = {
            primary: {
                name: 'primary',
                hexcode: selectedPrimary,
            },
            background: {
                name: 'neutral',
                hexcode: selectedBackground,
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

        const actualLightness = getColorLightness(color) ?? 100;
        const constrainedLightness = Math.max(88, actualLightness);

        setBackgroundLightness(constrainedLightness);
        applyColorsToCSS({ selectedBackground: color, selectedLightness: constrainedLightness });
    };

    const handleLightLightnessChange = (value: number) => {
        setBackgroundLightness(value);
    };

    const handleLightLightnessCommit = (value: number) => {
        applyColorsToCSS({ selectedLightness: value });
    };

    const handleDarkLightnessChange = (value: number) => {
        setDarkBackgroundLightness(value);
    };

    const handleDarkLightnessCommit = (value: number) => {
        applyColorsToCSS({ selectedDarkLightness: value });
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
                        onValueCommitted={handleLightLightnessCommit}
                        ariaLabel="Light mode background lightness"
                        min={88}
                        max={100}
                    />
                    <LightnessSlider
                        icon={<DarkIcon />}
                        value={darkBackgroundLightness}
                        onValueChange={handleDarkLightnessChange}
                        onValueCommitted={handleDarkLightnessCommit}
                        ariaLabel="Dark mode background lightness"
                        min={0}
                        max={15}
                    />
                </div>
            </PanelSectionWrapper.Contents>
        </PanelSectionWrapper.Root>
    );
};

export { SectionColor };
