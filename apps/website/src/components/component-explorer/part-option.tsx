'use client';

import { type KeyboardEvent, memo, useCallback } from 'react';

import { Text } from '@vapor-ui/core';
import clsx from 'clsx';

interface PartOptionProps {
    partName: string;
    displayName: string;
    isSelected: boolean;
    tabIndex: number;
    onMouseEnter: (partName: string) => void;
    onMouseLeave: () => void;
    onFocus: (partName: string) => void;
    onClick: (partName: string) => void;
}

export const PartOption = memo(function PartOption({
    partName,
    displayName,
    isSelected,
    tabIndex,
    onMouseEnter,
    onMouseLeave,
    onFocus,
    onClick,
}: PartOptionProps) {
    const handleMouseEnter = useCallback(() => {
        onMouseEnter(partName);
    }, [onMouseEnter, partName]);

    const handleFocus = useCallback(() => {
        onFocus(partName);
    }, [onFocus, partName]);

    const handleClick = useCallback(() => {
        onClick(partName);
    }, [onClick, partName]);

    const handleKeyDown = useCallback(
        (event: KeyboardEvent<HTMLDivElement>) => {
            if (event.key === 'Enter' || event.key === ' ') {
                onClick(partName);
                event.preventDefault();
            }
        },
        [onClick, partName],
    );

    return (
        <div
            role="option"
            id={`part-${partName}`}
            aria-selected={isSelected}
            tabIndex={tabIndex}
            data-explorer-part-button="true"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={onMouseLeave}
            onFocus={handleFocus}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            className={clsx(
                'group relative w-full flex items-center justify-start px-3 py-2 h-auto min-h-11 rounded-md text-left',
                'cursor-pointer',
                'before:absolute before:inset-0 before:rounded-[inherit] before:bg-[var(--vapor-color-gray-900)] before:opacity-0 before:transition-opacity before:pointer-events-none',
                'hover:before:opacity-[0.08] focus-visible:before:opacity-[0.08] active:before:opacity-[0.16]',
                'focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--vapor-color-foreground-normal-200)]',
                'transition-colors duration-150 ease-out',
                'motion-reduce:transition-none',
                isSelected && 'bg-v-primary-100',
            )}
        >
            <div className="flex items-center gap-2 w-full">
                <div className="flex-1 min-w-0 truncate text-left">
                    <Text
                        typography="body3"
                        foreground={isSelected ? 'primary-100' : 'normal-100'}
                        className="transition-colors duration-150 opacity-60"
                    >
                        {displayName}.
                    </Text>
                    <Text
                        typography="body3"
                        foreground={isSelected ? 'primary-100' : 'normal-100'}
                        className="font-mono font-medium transition-colors duration-150"
                    >
                        {partName}
                    </Text>
                </div>
            </div>

            {/* Left border indicator */}
            <div
                className={clsx(
                    'absolute left-0 top-1/2 -translate-y-1/2 w-0.5 rounded-full bg-v-primary-500 transition-all duration-150',
                    isSelected ? 'h-5' : 'h-0',
                )}
            />
        </div>
    );
});
