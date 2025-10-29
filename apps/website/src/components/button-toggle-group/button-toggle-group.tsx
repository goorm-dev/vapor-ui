'use client';

import type { ReactNode, RefObject } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Toggle, ToggleGroup } from '@base-ui-components/react';
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

// 개선안: 커스텀 훅 분리
const useMaskPosition = (
    itemRefs: RefObject<{ [key: string]: HTMLButtonElement | null }>,
    containerRef: RefObject<HTMLDivElement>,
) => {
    const [maskStyle, setMaskStyle] = useState<React.CSSProperties>({});

    const updateMaskPosition = useCallback(
        (value: string) => {
            const targetElement = itemRefs.current?.[value];
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
        },
        [containerRef, itemRefs],
    );

    return { maskStyle, updateMaskPosition };
};

// ToggleMask 컴포넌트 분리 - React.memo로 최적화
interface ToggleMaskProps {
    style: React.CSSProperties;
}

const ToggleMask = ({ style }: ToggleMaskProps) => {
    return (
        <div
            className="absolute z-0 flex justify-center items-center bg-v-canvas border border-v-normal rounded-v-300 shadow-sm transition-all duration-200 ease-out"
            style={style}
            aria-hidden="true"
        />
    );
};

ToggleMask.displayName = 'ToggleMask';

// ToggleItem 컴포넌트 분리 - React.memo로 최적화
interface ToggleItemProps {
    item: ToggleItem;
    isSelected: boolean;
    onClick: () => void;
    ref: (el: HTMLButtonElement | null) => void;
}

const ToggleItem = ({ item, isSelected, onClick, ref }: ToggleItemProps) => {
    return (
        <Toggle
            ref={ref}
            type="button"
            role="radio"
            aria-checked={isSelected}
            value={item.value}
            aria-label={
                typeof item.label === 'string'
                    ? `Select ${item.label}`
                    : `Select option ${item.value}`
            }
            onClick={onClick}
            className={clsx(
                'relative z-10 flex items-center justify-center w-v-300 h-v-300 gap-v-050 border-none bg-transparent cursor-pointer font-medium transition-colors duration-150 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                isSelected ? 'text-v-normal-200 ' : 'text-v-gray-500 hover:text-v-normal',
            )}
        >
            {item.icon && <span className="flex items-center">{item.icon}</span>}
            {item.label}
        </Toggle>
    );
};

ToggleItem.displayName = 'ToggleItem';

export function ButtonToggleGroup({
    items,
    defaultValue,
    onValueChange,
    className = '',
}: ButtonToggleGroupProps) {
    const [selectedValue, setSelectedValue] = useState(defaultValue || items[0]?.value || '');
    const containerRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
    const { maskStyle: computedMaskStyle, updateMaskPosition } = useMaskPosition(
        itemRefs,
        containerRef,
    );

    useEffect(() => {
        updateMaskPosition(selectedValue);
    }, [selectedValue, updateMaskPosition]);

    useEffect(() => {
        const handleResize = () => updateMaskPosition(selectedValue);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [selectedValue, updateMaskPosition]);

    // 콜백 함수 메모이제이션
    const handleValueChange = useCallback(
        ([value]: string[]) => {
            setSelectedValue(value);
            onValueChange?.(value);
        },
        [onValueChange],
    );

    // ref 함수 메모이제이션
    const createSetRef = (itemValue: string) => {
        return (el: HTMLButtonElement | null) => {
            itemRefs.current[itemValue] = el;
        };
    };

    // onClick 핸들러 메모이제이션
    const createOnClick = (itemValue: string) => {
        return () => handleValueChange([itemValue]);
    };

    // 렌더링할 아이템들 메모이제이션
    const renderedItems = () =>
        items.map((item) => (
            <ToggleItem
                key={item.value}
                item={item}
                isSelected={selectedValue === item.value}
                onClick={createOnClick(item.value)}
                ref={createSetRef(item.value)}
            />
        ));

    return (
        <ToggleGroup
            value={[selectedValue]}
            onValueChange={handleValueChange}
            ref={containerRef}
            role="radiogroup"
            aria-label="Toggle options"
            className={clsx(
                'relative flex bg-v-gray-100 border border-v-normal rounded-v-300 p-[1px] gap-v-50',
                className,
            )}
        >
            <ToggleMask style={computedMaskStyle} />

            {renderedItems()}
        </ToggleGroup>
    );
}
