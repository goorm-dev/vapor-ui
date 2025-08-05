'use client';

import type { ReactNode } from 'react';

import { InfoCircleOutlineIcon } from '@vapor-ui/icons';
import { Popover, PopoverContent, PopoverTrigger } from 'fumadocs-ui/components/ui/popover';

export function Info({ children }: { children: ReactNode }): ReactNode {
    return (
        <Popover>
            <PopoverTrigger>
                <InfoCircleOutlineIcon size={14} color="var(--vapor-color-foreground-hint)" />
            </PopoverTrigger>
            <PopoverContent className="prose max-h-[400px] min-w-[220px] max-w-[400px] overflow-auto text-sm prose-no-margin">
                {children}
            </PopoverContent>
        </Popover>
    );
}
