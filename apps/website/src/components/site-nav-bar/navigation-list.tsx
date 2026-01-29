'use client';

import { IconButton, NavigationMenu } from '@vapor-ui/core';
import clsx from 'clsx';
import Link from 'fumadocs-core/link';
import { usePathname } from 'next/navigation';

import { docsLinks, externalLinks } from '~/constants/site-links';

import { ThemeToggle } from '../theme-toggle';

interface SiteNavigationProps extends Omit<NavigationMenu.Root.Props, 'aria-label'> {
    leftSlot?: React.ReactNode;
}

export const SiteNavigation = ({ leftSlot, className, ...props }: SiteNavigationProps) => {
    const pathname = usePathname();

    return (
        <NavigationMenu.Root
            aria-label="Main"
            className={clsx('flex flex-1 items-center justify-end gap-2', className)}
            {...props}
        >
            <NavigationMenu.List className="items-center">
                <NavigationMenu.Item>{leftSlot}</NavigationMenu.Item>

                {docsLinks.map((link) => {
                    return (
                        <NavigationMenu.Item key={link.text}>
                            <NavigationMenu.Link
                                href={link.url}
                                current={pathname.includes(link.url)}
                                render={<Link>{link.text}</Link>}
                            />
                        </NavigationMenu.Item>
                    );
                })}

                {externalLinks.map((link) => {
                    return (
                        <NavigationMenu.Item key={link.text}>
                            <IconButton
                                aria-label={`move to ${link.text} site`}
                                size="md"
                                colorPalette="secondary"
                                variant="ghost"
                                render={<Link href={link.url}>{link.icon}</Link>}
                            />
                        </NavigationMenu.Item>
                    );
                })}

                <NavigationMenu.Item>
                    <ThemeToggle size="md" />
                </NavigationMenu.Item>
            </NavigationMenu.List>
        </NavigationMenu.Root>
    );
};
