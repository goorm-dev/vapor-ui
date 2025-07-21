'use client';

import React, { Children, cloneElement, isValidElement, useEffect, useRef, useState } from 'react';

import clsx from 'clsx';

export interface ButtonToggleGroupProps {
    /** The currently active button index */
    activeIndex?: number;
    /** Default active index for uncontrolled mode */
    defaultIndex?: number;
    /** Callback when a button is clicked */
    onToggle?: (index: number) => void;
    /** Button size */
    size?: 'sm' | 'md' | 'lg';
    /** Whether buttons should stretch to fill container */
    stretch?: boolean;
    /** Additional className */
    className?: string;
    /** Button children */
    children: React.ReactNode;
}

export interface ButtonToggleItemProps {
    /** Button content */
    children: React.ReactNode;
    /** Additional className */
    className?: string;
    /** Click handler */
    onClick?: () => void;
    /** Data index for internal use */
    'data-index'?: number;
}

export function ButtonToggleItem({
    children,
    className,
    onClick,
    'data-index': dataIndex,
    ...props
}: ButtonToggleItemProps) {
    return (
        <button
            type="button"
            className={clsx(
                'relative z-10 px-[var(--vapor-size-space-300)] py-2 text-sm font-medium transition-colors rounded-md',
                'hover:text-gray-900 dark:hover:[var(--vapor-color-foreground-normal)]',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                className,
            )}
            onClick={onClick}
            data-index={dataIndex}
            {...props}
        >
            {children}
        </button>
    );
}

export function ButtonToggleGroup({
    activeIndex: controlledActiveIndex,
    defaultIndex = 0,
    onToggle,
    size = 'md',
    stretch = false,
    className,
    children,
}: ButtonToggleGroupProps) {
    const isControlled = controlledActiveIndex !== undefined;
    const [internalActiveIndex, setInternalActiveIndex] = useState(defaultIndex);
    const activeIndex = isControlled ? controlledActiveIndex : internalActiveIndex;

    const containerRef = useRef<HTMLDivElement>(null);
    const [maskStyle, setMaskStyle] = useState<React.CSSProperties>({});

    const handleToggle = (index: number) => {
        if (!isControlled) {
            setInternalActiveIndex(index);
        }
        onToggle?.(index);
    };

    // Update mask position when active index changes
    useEffect(() => {
        if (containerRef.current) {
            const buttons = containerRef.current.querySelectorAll('button');
            const activeButton = buttons[activeIndex];

            if (activeButton) {
                const containerRect = containerRef.current.getBoundingClientRect();
                const buttonRect = activeButton.getBoundingClientRect();

                setMaskStyle({
                    width: buttonRect.width,
                    height: buttonRect.height,
                    transform: `translateX(${buttonRect.left - containerRect.left - 4}px)`,
                    transition: 'transform 0.2s ease-in-out, width 0.2s ease-in-out',
                });
            }
        }
    }, [activeIndex]);

    const sizeClasses = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
    };

    return (
        <div className={clsx(stretch && 'w-full')}>
            <div
                ref={containerRef}
                className={clsx(
                    'relative inline-flex rounded-[var(--vapor-size-borderRadius-400)] bg-[var(--vapor-color-gray-100)] p-[var(--vapor-size-space-050)] border border-[var(--vapor-color-border-normal)]',
                    'overflow-visible', // Ensure focus rings aren't clipped
                    sizeClasses[size],
                    stretch && 'w-full',
                    className,
                )}
                role="group"
            >
                {/* Active button mask */}
                <div
                    className="absolute bg-[var(--vapor-color-background-normal)] rounded-[var(--vapor-size-borderRadius-300)] shadow-sm border  border-[var(--vapor-color-border-normal)]"
                    style={maskStyle}
                />

                {/* Buttons */}
                {Children.map(children, (child, index) => {
                    if (isValidElement(child)) {
                        const isActive = index === activeIndex;

                        return cloneElement(child, {
                            ...child.props,
                            key: index,
                            className: clsx(
                                child.props.className,
                                stretch && 'flex-1',
                                isActive
                                    ? 'text-[var(--vapor-color-foreground-normal)]'
                                    : 'text-[var(--vapor-color-gray-500)]',
                            ),
                            onClick: () => {
                                handleToggle(index);
                                child.props.onClick?.();
                            },
                        });
                    }
                    return child;
                })}
            </div>
        </div>
    );
}

// Compound component pattern
ButtonToggleGroup.Item = ButtonToggleItem;
