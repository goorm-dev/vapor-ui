'use client';

import clsx from 'clsx';

interface PartButtonProps {
    partName: string;
    displayName: string;
    isHovered: boolean;
    isPrimitive?: boolean;
    index?: number;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onFocus?: () => void;
    onBlur?: () => void;
}

export function PartButton({
    partName,
    displayName,
    isHovered,
    isPrimitive = false,
    onMouseEnter,
    onMouseLeave,
    onFocus,
    onBlur,
}: PartButtonProps) {
    return (
        <button
            type="button"
            aria-pressed={isHovered}
            className={clsx(
                'group relative w-full text-left px-3 py-2 rounded-md',
                'transition-colors duration-150 ease-out',
                'motion-reduce:transition-none',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-v-primary-500 focus-visible:ring-offset-1',
                isHovered
                    ? 'bg-v-primary-100'
                    : 'hover:bg-v-normal-100',
                isPrimitive && 'opacity-50',
            )}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onFocus={onFocus || onMouseEnter}
            onBlur={onBlur || onMouseLeave}
        >
            <div className="flex items-center gap-2">
                {/* Indicator dot */}
                <div
                    className={clsx(
                        'w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors duration-150',
                        isHovered ? 'bg-v-primary-500' : 'bg-v-normal-300',
                    )}
                />

                {/* Part name */}
                <span className="flex-1 min-w-0 truncate">
                    <span
                        className={clsx(
                            'text-xs transition-colors duration-150',
                            isHovered ? 'text-v-primary-400' : 'text-v-normal-400',
                        )}
                    >
                        {displayName}.
                    </span>
                    <span
                        className={clsx(
                            'text-sm font-medium font-mono transition-colors duration-150',
                            isHovered ? 'text-v-primary-600' : 'text-v-normal-800',
                        )}
                    >
                        {partName}
                    </span>
                </span>

                {/* Arrow */}
                <svg
                    className={clsx(
                        'w-3.5 h-3.5 flex-shrink-0 transition-all duration-150',
                        isHovered
                            ? 'text-v-primary-500 translate-x-0.5'
                            : 'text-v-normal-300 opacity-0 group-hover:opacity-100',
                    )}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
            </div>

            {/* Left border indicator */}
            <div
                className={clsx(
                    'absolute left-0 top-1/2 -translate-y-1/2 w-0.5 rounded-full bg-v-primary-500 transition-all duration-150',
                    isHovered ? 'h-5' : 'h-0',
                )}
            />
        </button>
    );
}
