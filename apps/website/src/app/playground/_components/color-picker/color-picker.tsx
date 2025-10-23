'use client';

import type { ReactNode } from 'react';
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

import { TextInput } from '@vapor-ui/core';

/* -------------------------------------------------------------------------------------------------
 * Utilities
 * -----------------------------------------------------------------------------------------------*/

const hexToHsv = (hex: string): { h: number; s: number; v: number } => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;

    let h = 0;
    if (diff !== 0) {
        if (max === r) h = 60 * (((g - b) / diff) % 6);
        else if (max === g) h = 60 * ((b - r) / diff + 2);
        else h = 60 * ((r - g) / diff + 4);
    }
    if (h < 0) h += 360;

    const s = max === 0 ? 0 : diff / max;
    const v = max;

    return { h, s, v };
};

const hsvToHex = (h: number, s: number, v: number): string => {
    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;

    let r = 0,
        g = 0,
        b = 0;
    if (0 <= h && h < 60) [r, g, b] = [c, x, 0];
    else if (60 <= h && h < 120) [r, g, b] = [x, c, 0];
    else if (120 <= h && h < 180) [r, g, b] = [0, c, x];
    else if (180 <= h && h < 240) [r, g, b] = [0, x, c];
    else if (240 <= h && h < 300) [r, g, b] = [x, 0, c];
    else if (300 <= h && h < 360) [r, g, b] = [c, 0, x];

    const red = Math.round((r + m) * 255);
    const green = Math.round((g + m) * 255);
    const blue = Math.round((b + m) * 255);

    return `#${red.toString(16).padStart(2, '0')}${green.toString(16).padStart(2, '0')}${blue.toString(16).padStart(2, '0')}`;
};

/* -------------------------------------------------------------------------------------------------
 * ColorPicker Context
 * -----------------------------------------------------------------------------------------------*/

interface ColorPickerContextValue {
    color: string;
    hsv: { h: number; s: number; v: number };
    disabled: boolean;
    width?: number | string;
    height?: number | string;
    isDragging: boolean;
    isHueDragging: boolean;
    updateSaturationValue: (e: React.MouseEvent | MouseEvent) => void;
    updateHueValue: (e: React.MouseEvent | MouseEvent) => void;
    setIsDragging: (dragging: boolean) => void;
    setIsHueDragging: (dragging: boolean) => void;
    saturationRef: React.RefObject<HTMLDivElement>;
    hueRef: React.RefObject<HTMLDivElement>;
    onSaturationChange?: (color: string) => void;
    onHueChange?: (color: string) => void;
    updateColorDirectly: (color: string) => void;
}

const ColorPickerContext = createContext<ColorPickerContextValue | null>(null);

const useColorPickerContext = () => {
    const context = useContext(ColorPickerContext);
    if (!context) {
        throw new Error('ColorPicker compound components must be used within ColorPicker');
    }
    return context;
};

/* -------------------------------------------------------------------------------------------------
 * ColorPicker.Root
 * -----------------------------------------------------------------------------------------------*/

interface ColorPickerRootProps {
    children: ReactNode;
    defaultValue?: string;
    width?: number | string;
    disabled?: boolean;
    onSaturationChange?: (color: string) => void;
    onHueChange?: (color: string) => void;
    className?: string;
}

const ColorPickerRoot = ({
    children,
    defaultValue = '#245ecf',
    width = 250,
    disabled = false,
    onSaturationChange,
    onHueChange,
    className = '',
}: ColorPickerRootProps) => {
    const [color, setColor] = useState(defaultValue);
    const [hsv, setHsv] = useState(() => hexToHsv(defaultValue));
    const [isDragging, setIsDragging] = useState(false);
    const [isHueDragging, setIsHueDragging] = useState(false);

    const saturationRef = useRef<HTMLDivElement>(null);
    const hueRef = useRef<HTMLDivElement>(null);

    const updateSaturationValue = useCallback((e: React.MouseEvent | MouseEvent) => {
        if (!saturationRef.current) return;

        const rect = saturationRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
        const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));

        const s = x / rect.width;
        const v = 1 - y / rect.height;

        setHsv((prevHsv) => {
            const newHsv = { ...prevHsv, s, v };
            const newColor = hsvToHex(newHsv.h, newHsv.s, newHsv.v);
            setColor(newColor);
            return newHsv;
        });
    }, []);

    const updateHueValue = useCallback(
        (e: React.MouseEvent | MouseEvent) => {
            if (!hueRef.current) return;

            const rect = hueRef.current.getBoundingClientRect();
            const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
            const h = (x / rect.width) * 360;

            const newHsv = { ...hsv, h };
            setHsv(newHsv);

            const newColor = hsvToHex(newHsv.h, newHsv.s, newHsv.v);
            setColor(newColor);
        },
        [hsv],
    );

    const updateColorDirectly = useCallback((newColor: string) => {
        try {
            const newHsv = hexToHsv(newColor);
            setHsv(newHsv);
            setColor(newColor);
        } catch {
            // Invalid color, ignore
        }
    }, []);

    const contextValue: ColorPickerContextValue = useMemo(
        () => ({
            color,
            hsv,
            disabled,
            width,
            isDragging,
            isHueDragging,
            updateSaturationValue,
            updateHueValue,
            setIsDragging,
            setIsHueDragging,
            saturationRef,
            hueRef,
            onSaturationChange,
            onHueChange,
            updateColorDirectly,
        }),
        [
            color,
            hsv,
            disabled,
            width,
            isDragging,
            isHueDragging,
            updateSaturationValue,
            updateHueValue,
            onSaturationChange,
            onHueChange,
            updateColorDirectly,
        ],
    );

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) updateSaturationValue(e);
            if (isHueDragging) updateHueValue(e);
        };

        const handleMouseUp = () => {
            if (isDragging) {
                onSaturationChange?.(color);
            }
            if (isHueDragging) {
                onHueChange?.(color);
            }
            setIsDragging(false);
            setIsHueDragging(false);
        };

        if (isDragging || isHueDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [
        isDragging,
        isHueDragging,
        updateSaturationValue,
        updateHueValue,
        color,
        onSaturationChange,
        onHueChange,
    ]);

    return (
        <ColorPickerContext.Provider value={contextValue}>
            <div
                className={`flex flex-col select-none gap-v-50 ${className} ${disabled ? 'opacity-60 pointer-events-none' : ''}`}
                style={{ width }}
            >
                {children}
            </div>
        </ColorPickerContext.Provider>
    );
};

/* -------------------------------------------------------------------------------------------------
 * ColorPicker.Saturation
 * -----------------------------------------------------------------------------------------------*/

interface ColorPickerSaturationProps {
    height?: number | string;
}

const ColorPickerSaturation = ({ height = 200 }: ColorPickerSaturationProps) => {
    const { hsv, disabled, updateSaturationValue, setIsDragging, saturationRef } =
        useColorPickerContext();

    const handleSaturationMouseDown = useCallback(
        (e: React.MouseEvent) => {
            if (disabled) return;
            setIsDragging(true);
            updateSaturationValue(e);
        },
        [disabled, updateSaturationValue, setIsDragging],
    );

    const saturationBackground = useMemo(
        () =>
            `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${hsv.h}, 100%, 50%))`,
        [hsv.h],
    );

    return (
        <div className="relative rounded-lg overflow-hidden">
            <div
                ref={saturationRef}
                className={`relative w-full rounded-lg border border-gray-200 ${disabled ? 'cursor-not-allowed' : 'cursor-crosshair'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                style={{
                    background: saturationBackground,
                    height,
                }}
                onMouseDown={handleSaturationMouseDown}
                role="slider"
                aria-label="색상 채도 및 명도 선택"
                aria-valuenow={Math.round(hsv.s * 100)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuetext={`채도 ${Math.round(hsv.s * 100)}%, 명도 ${Math.round(hsv.v * 100)}%`}
                tabIndex={disabled ? -1 : 0}
            >
                <div
                    className="absolute w-4 h-4 border-2 border-white rounded-full shadow-md pointer-events-none z-10 transform -translate-x-1/2 -translate-y-1/2 after:content-[''] after:absolute after:top-1/2 after:left-1/2 after:w-1 after:h-1 after:bg-white after:bg-opacity-50 after:rounded-full after:transform after:-translate-x-1/2 after:-translate-y-1/2"
                    style={{
                        left: `${hsv.s * 100}%`,
                        top: `${(1 - hsv.v) * 100}%`,
                    }}
                />
            </div>
        </div>
    );
};

/* -------------------------------------------------------------------------------------------------
 * ColorPicker.Hue
 * -----------------------------------------------------------------------------------------------*/

const ColorPickerHue = () => {
    const { hsv, disabled, updateHueValue, setIsHueDragging, hueRef } = useColorPickerContext();

    const handleHueMouseDown = useCallback(
        (e: React.MouseEvent) => {
            if (disabled) return;
            setIsHueDragging(true);
            updateHueValue(e);
        },
        [disabled, updateHueValue, setIsHueDragging],
    );

    const hueBackground = useMemo(
        () =>
            'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
        [],
    );

    return (
        <div className="relative w-full h-4 rounded-full overflow-hidden">
            <div
                ref={hueRef}
                className={`w-full h-full rounded-full border border-gray-200 relative ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                style={{
                    background: hueBackground,
                }}
                onMouseDown={handleHueMouseDown}
                role="slider"
                aria-label="색조 선택"
                aria-valuenow={Math.round(hsv.h)}
                aria-valuemin={0}
                aria-valuemax={360}
                aria-valuetext={`색조 ${Math.round(hsv.h)}도`}
                tabIndex={disabled ? -1 : 0}
            >
                <div
                    className="absolute top-1/2 w-4 h-4 border-2 border-white rounded-full shadow-md pointer-events-none z-10 transform -translate-x-1/2 -translate-y-1/2 after:content-[''] after:absolute after:top-1/2 after:left-1/2 after:w-1 after:h-1 after:bg-white after:bg-opacity-50 after:rounded-full after:transform after:-translate-x-1/2 after:-translate-y-1/2"
                    style={{
                        left: `${(hsv.h / 360) * 100}%`,
                    }}
                />
            </div>
        </div>
    );
};

/* -------------------------------------------------------------------------------------------------
 * ColorPicker.Input
 * -----------------------------------------------------------------------------------------------*/

interface ColorPickerInputProps {
    onColorChange?: (color: string) => void;
}

const isValidHexColor = (hex: string): boolean => {
    return /^#([0-9A-F]{3}|[0-9A-F]{6})$/i.test(hex);
};

const expandShortHex = (hex: string): string => {
    if (hex.length === 4) {
        return '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
    }
    return hex;
};

const ColorPickerInput = ({ onColorChange }: ColorPickerInputProps) => {
    const { color, disabled, updateColorDirectly } = useColorPickerContext();
    const [inputValue, setInputValue] = useState(color);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (!isEditing) {
            setInputValue(color);
        }
    }, [color, isEditing]);

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            let value = e.target.value;

            // Ensure it starts with #
            if (!value.startsWith('#')) {
                value = '#' + value;
            }

            // Remove non-hex characters (except #)
            value = value.replace(/[^#0-9A-Fa-f]/g, '');

            // Limit length to 7 characters (#RRGGBB)
            if (value.length > 7) {
                value = value.slice(0, 7);
            }

            setInputValue(value.toUpperCase());

            // Auto-apply for valid 3 or 6 digit hex codes
            if (value.length === 4 || value.length === 7) {
                if (isValidHexColor(value)) {
                    const expandedHex = expandShortHex(value);
                    updateColorDirectly(expandedHex);
                    onColorChange?.(expandedHex);
                }
            }
        },
        [updateColorDirectly, onColorChange],
    );

    const handleFocus = useCallback(() => {
        setIsEditing(true);
    }, []);

    const handleBlur = useCallback(() => {
        setIsEditing(false);
        // Revert to current color if input is invalid
        if (!isValidHexColor(inputValue)) {
            setInputValue(color);
        }
    }, [inputValue, color]);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
                if (isValidHexColor(inputValue)) {
                    const expandedHex = expandShortHex(inputValue);
                    updateColorDirectly(expandedHex);
                    onColorChange?.(expandedHex);
                }
                e.currentTarget.blur();
            } else if (e.key === 'Escape') {
                setInputValue(color);
                e.currentTarget.blur();
            }
        },
        [inputValue, updateColorDirectly, onColorChange, color],
    );

    return (
        <div className="w-full relative">
            <TextInput
                value={inputValue}
                onChange={handleInputChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                maxLength={7}
                disabled={disabled}
                className="w-full pl-v-400 font-mono"
                placeholder="#000000"
            />
            <div
                className="w-4 h-4 rounded border border-gray-300 flex-shrink-0 absolute left-v-150 top-v-100"
                style={{ backgroundColor: color }}
                aria-label={`선택된 색상: ${color}`}
            />
        </div>
    );
};

/* -----------------------------------------------------------------------------------------------*/

export const ColorPicker = {
    Root: ColorPickerRoot,
    Saturation: ColorPickerSaturation,
    Hue: ColorPickerHue,
    Input: ColorPickerInput,
};
