'use client';

import type { ReactNode } from 'react';

import { Tabs } from '@vapor-ui/core';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface DocsTabsProps {
    children: ReactNode;
}

export const DocsTabs = ({ children }: DocsTabsProps) => {
    const pathname = usePathname();
    return (
        <Tabs.Root value={pathname}>
            <Tabs.List>{children}</Tabs.List>
        </Tabs.Root>
    );
};

interface DocsTabProps {
    href: string;
    children: ReactNode;
}

export const DocsTab = ({ href, children }: DocsTabProps) => (
    <Tabs.Button
        value={href}
        nativeButton={false}
        render={
            <Link className="no-underline" href={href}>
                {children}
            </Link>
        }
    >
        {children}
    </Tabs.Button>
);
