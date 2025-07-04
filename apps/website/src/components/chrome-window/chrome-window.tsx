'use client';

import { Text } from '@vapor-ui/core';
import { CloseOutlineIcon } from '@vapor-ui/icons';
import clsx from 'clsx';

import BrowserControlsIcon from '~public/icons/browser-controls.svg';
import SecureIcon from '~public/icons/secure.svg';
import TabLeftCurvedIcon from '~public/icons/tab-left-curved.svg';
import TabRightCurvedIcon from '~public/icons/tab-right-curved.svg';

interface ChromeWindowProps {
    className?: string;
}

export function ChromeWindow({ className = '' }: ChromeWindowProps) {
    return (
        <div
            className={clsx(
                'bg-[var(--vapor-color-background-normal)] rounded-[var(--vapor-size-borderRadius-500)] shadow-lg overflow-hidden w-full border border-[var(--vapor-color-border-normal)]',
                className,
            )}
        >
            {/* Window Controls */}
            <div className="h-[42px] px-3  flex items-center justify-start bg-[var(--vapor-color-background-normal-lighter)] border-b border-[var(--vapor-color-border-normal)] gap-[7px]">
                <div className="flex items-center gap-2">
                    <BrowserControlsIcon />
                </div>
                <div className="relative bottom-[-4px]">
                    <span className="absolute left-[-6px] bottom-0">
                        <TabLeftCurvedIcon />
                    </span>
                    <div className="flex items-center gap-[9px] p-[var(--vapor-size-space-100)] pl-[var(--vapor-size-space-200)] min-w-0 flex-shrink-0 relative bg-[var(--vapor-color-background-secondary)] rounded-t-[var(--vapor-size-borderRadius-300)]">
                        <div className="flex gap-[9px]">
                            <Text typography="subtitle2" foreground="normal">
                                Vapor UI
                            </Text>
                            <CloseOutlineIcon size="18" />
                        </div>
                    </div>
                    <span className="absolute right-[-6px] bottom-0">
                        <TabRightCurvedIcon />
                    </span>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex h-[38px] bg-[var(--vapor-color-background-secondary)] items-center px-3">
                <div className="h-[28px] rounded-[14px] bg-[var(--vapor-color-background-normal)] w-full">
                    <div className="flex items-center gap-2 px-3 py-1 h-full">
                        <SecureIcon color="var(--vapor-color-foreground-secondary)" />
                        <Text typography="subtitle2" foreground="secondary">
                            Vapor UI Playground
                        </Text>
                    </div>
                </div>
            </div>
            <div className="h-96 bg-white flex items-center justify-center">
                <div className="text-center">
                    <Text typography="heading3" foreground="hint" className="mb-2">
                        Welcome to Chrome Window
                    </Text>
                    <Text typography="body2" foreground="hint">
                        This is a simulated browser window component
                    </Text>
                </div>
            </div>
        </div>
    );
}
