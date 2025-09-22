'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { TextInput } from '@vapor-ui/core';

// 컬러 유틸리티 함수들
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

export interface ColorPickerProps {
    /** 초기 색상 값 (hex 형식) */
    defaultValue?: string;
    /** 색상 변경 시 호출되는 콜백 함수 */
    onColorChange?: (color: string) => void;
    /** 컴포넌트의 너비 */
    width?: number | string;
    /** 컴포넌트의 높이 */
    height?: number | string;
    /** 클래스명 */
    className?: string;
    /** 비활성화 상태 */
    disabled?: boolean;
}

const ColorPicker: React.FC<ColorPickerProps> = ({
    defaultValue = '#245ecf',
    onColorChange,
    width = 250,
    height = 200,
    className = '',
    disabled = false,
}) => {
    const [color, setColor] = useState(defaultValue);
    const [hsv, setHsv] = useState(() => hexToHsv(defaultValue));
    const [isDragging, setIsDragging] = useState(false);
    const [isHueDragging, setIsHueDragging] = useState(false);

    const saturationRef = useRef<HTMLDivElement>(null);
    const hueRef = useRef<HTMLDivElement>(null);

    // 색상 변경 처리
    const handleColorChange = useCallback(
        (newColor: string) => {
            setColor(newColor);
            onColorChange?.(newColor);
        },
        [onColorChange],
    );

    const updateSaturationValue = useCallback(
        (e: React.MouseEvent | MouseEvent) => {
            if (!saturationRef.current) return;

            const rect = saturationRef.current.getBoundingClientRect();
            const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
            const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));

            const s = x / rect.width;
            const v = 1 - y / rect.height;

            const newHsv = { ...hsv, s, v };
            setHsv(newHsv);

            const newColor = hsvToHex(newHsv.h, newHsv.s, newHsv.v);
            handleColorChange(newColor);
        },
        [hsv, handleColorChange],
    );

    const updateHueValue = useCallback(
        (e: React.MouseEvent | MouseEvent) => {
            if (!hueRef.current) return;

            const rect = hueRef.current.getBoundingClientRect();
            const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
            const h = (x / rect.width) * 360;

            const newHsv = { ...hsv, h };
            setHsv(newHsv);

            const newColor = hsvToHex(newHsv.h, newHsv.s, newHsv.v);
            handleColorChange(newColor);
        },
        [hsv, handleColorChange],
    );

    // 색상 영역에서 마우스 이벤트 처리
    const handleSaturationMouseDown = useCallback(
        (e: React.MouseEvent) => {
            if (disabled) return;
            setIsDragging(true);
            updateSaturationValue(e);
        },
        [disabled, updateSaturationValue],
    );

    // 색조 슬라이더에서 마우스 이벤트 처리
    const handleHueMouseDown = useCallback(
        (e: React.MouseEvent) => {
            if (disabled) return;
            setIsHueDragging(true);
            updateHueValue(e);
        },
        [disabled, updateHueValue],
    );

    // 마우스 이벤트 리스너
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) updateSaturationValue(e);
            if (isHueDragging) updateHueValue(e);
        };

        const handleMouseUp = () => {
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
    }, [isDragging, isHueDragging, updateSaturationValue, updateHueValue]);

    // 입력 필드에서 색상 변경 처리
    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value.toUpperCase();
            if (/^[0-9A-F]{0,6}$/.test(value)) {
                const hexValue = value.length === 6 ? `#${value}` : color;
                if (value.length === 6) {
                    const newHsv = hexToHsv(hexValue);
                    setHsv(newHsv);
                    handleColorChange(hexValue);
                }
            }
        },
        [color, handleColorChange],
    );

    const saturationBackground = useMemo(
        () =>
            `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${hsv.h}, 100%, 50%))`,
        [hsv.h],
    );

    const hueBackground = useMemo(
        () =>
            'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
        [],
    );

    return (
        <div
            className={`flex flex-col select-none gap-v-100 ${className} ${disabled ? 'opacity-60 pointer-events-none' : ''}`}
            style={{ width }}
        >
            {/* 메인 색상 선택 영역 */}
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
                    {/* 선택 포인터 */}
                    <div
                        className="absolute w-4 h-4 border-2 border-white rounded-full shadow-md pointer-events-none z-10 transform -translate-x-1/2 -translate-y-1/2 after:content-[''] after:absolute after:top-1/2 after:left-1/2 after:w-1 after:h-1 after:bg-white after:bg-opacity-50 after:rounded-full after:transform after:-translate-x-1/2 after:-translate-y-1/2"
                        style={{
                            left: `${hsv.s * 100}%`,
                            top: `${(1 - hsv.v) * 100}%`,
                        }}
                    />
                </div>
            </div>

            {/* 색조 슬라이더 */}
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
                    {/* 색조 포인터 */}
                    <div
                        className="absolute top-1/2 w-4 h-4 border-2 border-white rounded-full shadow-md pointer-events-none z-10 transform -translate-x-1/2 -translate-y-1/2 after:content-[''] after:absolute after:top-1/2 after:left-1/2 after:w-1 after:h-1 after:bg-white after:bg-opacity-50 after:rounded-full after:transform after:-translate-x-1/2 after:-translate-y-1/2"
                        style={{
                            left: `${(hsv.h / 360) * 100}%`,
                        }}
                    />
                </div>
            </div>

            {/* 색상 입력 영역 */}
            <div className="flex gap-v-100">
                <div className="w-full relative">
                    <TextInput
                        value={color.slice(1)}
                        onChange={handleInputChange}
                        maxLength={6}
                        disabled={disabled}
                        className="w-full pl-v-400"
                    />
                    <div
                        className="w-4 h-4 rounded border border-gray-300 flex-shrink-0 absolute left-v-150 top-v-100"
                        style={{ backgroundColor: color }}
                        aria-label={`선택된 색상: ${color}`}
                    />
                </div>
            </div>
        </div>
    );
};

export default ColorPicker;
