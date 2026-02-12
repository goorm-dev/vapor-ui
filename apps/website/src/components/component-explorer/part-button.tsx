'use client';

import { memo } from 'react';

import { Button, Text } from '@vapor-ui/core';
import clsx from 'clsx';

interface PartButtonProps {
    partName: string;
    displayName: string;
    isHovered: boolean;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onFocus?: () => void;
    onBlur?: () => void;
}

export const PartButton = memo(function PartButton({
    partName,
    displayName,
    isHovered,
    onMouseEnter,
    onMouseLeave,
    onFocus,
    onBlur,
}: PartButtonProps) {
    return (
        <Button
            variant="ghost"
            colorPalette={isHovered ? 'primary' : 'secondary'}
            className={clsx(
                'group relative !w-full !justify-start !px-3 !py-2 !h-auto !rounded-md',
                'transition-colors duration-150 ease-out',
                'motion-reduce:transition-none',
                isHovered && '!bg-v-primary-100',
            )}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onFocus={onFocus || onMouseEnter}
            onBlur={onBlur || onMouseLeave}
        >
            <div className="flex items-center gap-2 w-full">
                {/* Part name */}
                <div className="flex-1 min-w-0 truncate text-left">
                    <Text
                        typography="body3"
                        foreground={isHovered ? 'primary-100' : 'normal-100'}
                        className="transition-colors duration-150 opacity-60"
                    >
                        {displayName}.
                    </Text>
                    <Text
                        typography="body3"
                        foreground={isHovered ? 'primary-100' : 'normal-100'}
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
                    isHovered ? 'h-5' : 'h-0',
                )}
            />
        </Button>
    );
});
