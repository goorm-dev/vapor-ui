'use client';

import React, { useMemo } from 'react';

import { IconButton, Nav } from '@vapor-ui/core';
import Link from 'fumadocs-core/link';
import type { LinkItemType, NavOptions } from 'fumadocs-ui/layouts/shared';

export function getLinks(links: LinkItemType[] = [], githubUrl?: string): LinkItemType[] {
    let result = links ?? [];

    if (githubUrl)
        result = [
            ...result,
            {
                type: 'icon',
                url: githubUrl,
                text: 'Github',
                label: 'GitHub',
                icon: (
                    <svg role="img" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                    </svg>
                ),
                external: true,
            },
        ];

    return result;
}

function isSecondary(item: LinkItemType): boolean {
    return ('secondary' in item && item.secondary === true) || item.type === 'icon';
}

/**
 * Global navigation bar used across the website.
 * Note: SearchToggle, ThemeToggle, etc. are intentionally omitted as requested.
 */
export const SiteNavBar: React.FC<
    Partial<
        NavOptions & {
            /**
             * Open mobile menu when hovering the trigger
             */
            enableHoverToOpen?: boolean;
            links?: LinkItemType[];
            githubUrl?: string;
        }
    >
> = ({ title, url, links, githubUrl }) => {
    // Items displayed inside the collapsible menu on mobile.
    const finalLinks = useMemo(() => getLinks(links, githubUrl), [links, githubUrl]);

    const navItems = finalLinks.filter((item) => ['nav', 'all'].includes(item.on ?? 'all'));
    const menuItems = finalLinks.filter((item) => ['menu', 'all'].includes(item.on ?? 'all'));

    return (
        <header className="flex w-full py-3 px-8 justify-between items-center h-[62px] fixed top-[var(--fd-banner-height)] bg-fd-background">
            <div className="flex items-center gap-10 relative w-full">
                <Nav
                    label="nav"
                    size="lg"
                    shape="ghost"
                    className="flex justify-between items-center gap-10 w-full"
                >
                    <div className="flex items-center gap-10">
                        <Link
                            href={url ?? '/'}
                            className="inline-flex items-center gap-2.5 font-semibold w-[68px] h-[26px]"
                        >
                            {title}
                        </Link>
                        <ul className="flex flex-row items-center gap-2 px-6 max-sm:hidden">
                            {navItems
                                .filter((item) => !isSecondary(item))
                                .map((item, i) => (
                                    <Nav.LinkItem key={i} className="text-sm">
                                        {item.type === 'icon' ? item.icon : item.text}
                                    </Nav.LinkItem>
                                ))}
                        </ul>
                    </div>
                    <div className="flex items-center gap-10">
                        <ul className="flex flex-row items-center max-sm:hidden">
                            {menuItems
                                .filter((item) => isSecondary(item))
                                .map((item, i) => {
                                    return (
                                        <Nav.LinkItem key={i} className="p-0" asChild>
                                            <IconButton
                                                size="lg"
                                                color="secondary"
                                                variant="ghost"
                                                asChild
                                            >
                                                <Link href={item.url}>
                                                    {item.type === 'icon' ? item.icon : item.text}
                                                </Link>
                                            </IconButton>
                                        </Nav.LinkItem>
                                    );
                                })}
                        </ul>
                    </div>
                </Nav>
            </div>
        </header>
    );
};

export default SiteNavBar;
