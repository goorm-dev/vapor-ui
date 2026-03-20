'use client';

import { memo, useCallback } from 'react';

import { RadioCard, Text } from '@vapor-ui/core';
import clsx from 'clsx';

interface PartButtonProps {
    partName: string;
    displayName: string;
    isHovered: boolean;
    onMouseEnter: (partName: string) => void;
    onMouseLeave: () => void;
}

export const PartButton = memo(function PartButton({
    partName,
    displayName,
    onMouseEnter,
    onMouseLeave,
}: PartButtonProps) {
    const handleMouseEnter = useCallback(() => {
        onMouseEnter(partName);
    }, [onMouseEnter, partName]);

    return (
        <RadioCard
            nativeButton
            value={partName}
            aria-label={`${displayName}.${partName} part`}
            data-explorer-part-button="true"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={onMouseLeave}
            render={(props, state) => {
                const isActive = state.checked;

                return (
                    <button
                        type="button"
                        {...props}
                        className={clsx(
                            'group relative w-full flex items-center justify-start px-3 py-2 h-auto min-h-11 rounded-md text-left',
                            'cursor-pointer',
                            'before:absolute before:inset-0 before:rounded-[inherit] before:bg-[var(--vapor-color-gray-900)] before:opacity-0 before:transition-opacity before:pointer-events-none',
                            'hover:before:opacity-[0.08] active:before:opacity-[0.16]',
                            'focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--vapor-color-foreground-normal-200)]',
                            'transition-colors duration-150 ease-out',
                            'motion-reduce:transition-none',
                            isActive && 'bg-v-primary-100',
                        )}
                    >
                        <div className="flex items-center gap-2 w-full">
                            <div className="flex-1 min-w-0 truncate text-left">
                                <Text
                                    typography="body3"
                                    foreground={isActive ? 'primary-100' : 'normal-100'}
                                    className="transition-colors duration-150 opacity-60"
                                >
                                    {displayName}.
                                </Text>
                                <Text
                                    typography="body3"
                                    foreground={isActive ? 'primary-100' : 'normal-100'}
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
                                isActive ? 'h-5' : 'h-0',
                            )}
                        />
                    </button>
                );
            }}
        />
    );
});
