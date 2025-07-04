'use client';

import { Button, Text } from '@vapor-ui/core';
import {
    CloseOutlineIcon,
    ExpandOutlineIcon,
    FileAddIcon,
    RefreshOutlineIcon,
    TimeOutlineIcon,
} from '@vapor-ui/icons';

interface ChromeWindowProps {
    className?: string;
}

export function ChromeWindow({ className = '' }: ChromeWindowProps) {
    const currentUrl = 'https://example.com';

    return (
        <div
            className={`bg-[var(--vapor-color-background-normal)] rounded-lg shadow-lg overflow-hidden ${className}`}
        >
            {/* Window Controls */}
            <div className="flex items-center justify-between bg-[var(--vapor-color-background-normal-lighter)] px-4 py-2 border-b border-[var(--vapor-color-border-hint)]">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" className="p-1 h-6 w-6">
                        <TimeOutlineIcon size={12} />
                    </Button>
                    <Button size="sm" variant="ghost" className="p-1 h-6 w-6">
                        <ExpandOutlineIcon size={12} />
                    </Button>
                    <Button size="sm" variant="ghost" className="p-1 h-6 w-6">
                        <CloseOutlineIcon size={12} />
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center bg-[var(--vapor-color-background-normal-lighter)] border-b border-[var(--vapor-color-border-hint)]">
                <div className="flex items-center flex-1 overflow-x-auto">
                    <div className="flex items-center gap-2 px-4 py-2 min-w-0 flex-shrink-0 border-r border-[var(--vapor-color-border-hint)] bg-[var(--vapor-color-background-normal)]">
                        <Text typography="body2" foreground="normal" className="truncate max-w-32">
                            New Tab
                        </Text>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 min-w-0 flex-shrink-0 border-r border-[var(--vapor-color-border-hint)] bg-[var(--vapor-color-background-normal-lighter)]">
                        <Text typography="body2" foreground="hint" className="truncate max-w-32">
                            Google
                        </Text>
                    </div>
                </div>
                <div className="p-2 h-8 w-8 flex items-center justify-center">
                    <FileAddIcon size={14} color="var(--vapor-color-foreground-hint)" />
                </div>
            </div>

            {/* Address Bar */}
            <div className="flex items-center gap-2 px-4 py-2 bg-[var(--vapor-color-background-normal-lighter)] border-b border-[var(--vapor-color-border-hint)]">
                <Button size="sm" variant="ghost" className="p-1 h-6 w-6">
                    <RefreshOutlineIcon size={12} />
                </Button>
                <div className="flex-1 flex items-center gap-2 px-3 py-1 bg-[var(--vapor-color-background-normal)] rounded border border-[var(--vapor-color-border-normal)]">
                    <Text typography="body2" foreground="hint" className="text-xs">
                        🔒
                    </Text>
                    <div className="flex-1 bg-transparent outline-none text-sm">{currentUrl}</div>
                </div>
            </div>

            {/* Content Area */}
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
