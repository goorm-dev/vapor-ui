'use client';

import type { ReactNode } from 'react';

import { InfoCircleOutlineIcon } from '@vapor-ui/icons';
import { Popover, PopoverContent, PopoverTrigger } from 'fumadocs-ui/components/ui/popover';

export function InfoPopover({ children }: { children: ReactNode }) {
    return (
        <Popover>
            <PopoverTrigger aria-label="정보 보기">
                <InfoCircleOutlineIcon size={14} color="var(--vapor-color-foreground-hint-100)" />
            </PopoverTrigger>
            <PopoverContent className="prose max-h-[400px] min-w-[220px] max-w-[400px] overflow-auto text-sm prose-no-margin">
                {children}
            </PopoverContent>
        </Popover>
    );
}
