'use client';

import type { ReactNode } from 'react';
import React, { useEffect, useRef, useState } from 'react';

import clsx from 'clsx';

interface ToggleItem {
    value: string;
    label: string | ReactNode;
    icon?: ReactNode;
}

interface ButtonToggleGroupProps {
    items: ToggleItem[];
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    className?: string;
}

export function ButtonToggleGroup({
    items,
    defaultValue,
    onValueChange,
    className = '',
}: ButtonToggleGroupProps) {
    const [selectedValue, setSelectedValue] = useState(defaultValue || items[0]?.value || '');
    const [maskStyle, setMaskStyle] = useState<React.CSSProperties>({});
    const containerRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

    const updateMaskPosition = (value: string) => {
        const targetElement = itemRefs.current[value];
        const container = containerRef.current;

        if (targetElement && container) {
            const containerRect = container.getBoundingClientRect();
            const targetRect = targetElement.getBoundingClientRect();

            // Calculate position to completely cover the toggle item
            const offsetLeft = targetRect.left - containerRect.left - 1;
            const offsetTop = targetRect.top - containerRect.top - 1;

            setMaskStyle({
                width: targetRect.width,
                height: targetRect.height,
                left: offsetLeft,
                top: offsetTop,
                position: 'absolute',
            });
        }
    };

    useEffect(() => {
        // Small delay to ensure DOM is updated and mask is centered properly
        const timer = setTimeout(() => {
            updateMaskPosition(selectedValue);
        }, 0);

        return () => clearTimeout(timer);
    }, [selectedValue]);

    useEffect(() => {
        const handleResize = () => updateMaskPosition(selectedValue);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [selectedValue]);

    const handleValueChange = (value: string) => {
        setSelectedValue(value);
        onValueChange?.(value);
    };

    return (
        <div
            ref={containerRef}
            role="group"
            aria-label="Toggle group"
            className={clsx(
                'relative w-fit flex justify-center items-center bg-[#F0F0F5] border border-[#E1E1E8] rounded-[8px] p-[1px] gap-[var(--vapor-size-space-050)]',
                className,
            )}
        >
            {/* Animated selection mask */}
            <div
                className="absolute z-0 flex justify-center items-center bg-[#FFF] border border-[#E1E1E8] rounded-[8px] shadow-sm transition-all duration-200 ease-out"
                style={maskStyle}
            />

            {items.map((item) => (
                <button
                    key={item.value}
                    ref={(el) => {
                        itemRefs.current[item.value] = el;
                    }}
                    type="button"
                    role="radio"
                    aria-checked={selectedValue === item.value}
                    onClick={() => handleValueChange(item.value)}
                    className={clsx(
                        'relative z-10 flex items-center justify-center w-[24px] h-[24px] gap-1 border-none bg-transparent cursor-pointer font-medium transition-colors duration-150 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                        selectedValue === item.value
                            ? 'text-gray-900'
                            : 'text-gray-600 hover:text-gray-900',
                    )}
                >
                    {item.icon && (
                        <span className={`${item.label ? 'mr-2' : ''} flex items-center`}>
                            {item.icon}
                        </span>
                    )}
                    {item.label}
                </button>
            ))}
        </div>
    );
}
