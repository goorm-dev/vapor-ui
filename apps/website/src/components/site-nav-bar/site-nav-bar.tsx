'use client';

import { useEffect, useState } from 'react';

import * as Dialog from '@radix-ui/react-dialog';
import { IconButton, NavigationMenu, Text } from '@vapor-ui/core';
import { CloseOutlineIcon, MenuOutlineIcon, OpenInNewOutlineIcon } from '@vapor-ui/icons';
import Link from 'fumadocs-core/link';
import type { LinkItemType } from 'fumadocs-ui/layouts/shared';
import { usePathname } from 'next/navigation';

import { externalLinks } from '~/constants/site-links';

import LogoVapor from '../../../public/icons/logo-vapor.svg';
import { ThemeToggle } from '../theme-toggle';

const NAVIGATION_LINKS = [
    { href: '/docs', label: 'Docs' },
    { href: '/playground', label: 'Playground' },
    { href: '/blocks', label: 'Blocks' },
];

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

function hasText(item: LinkItemType): item is LinkItemType & { text: string } {
    return 'text' in item && typeof (item as { text?: unknown }).text === 'string';
}

function hasUrl(item: LinkItemType): item is LinkItemType & { url: string } {
    return 'url' in item && typeof (item as { url?: unknown }).url === 'string';
}

const WebNavigation = () => {
    const pathname = usePathname();

    return (
        <NavigationMenu.Root
            aria-label="Main"
            size="lg"
            className="flex flex-1 justify-between items-center gap-10"
        >
            <NavigationMenu.List className="flex flex-1 flex-row items-center gap-2 p-0 h-full">
                {NAVIGATION_LINKS.map((item) => (
                    <NavigationMenu.LinkItem
                        key={item.href}
                        href={item.href}
                        selected={pathname.includes(item.href)}
                        render={<Link>{item.label}</Link>}
                    />
                ))}
            </NavigationMenu.List>

            <NavigationMenu.List className="flex-row items-center gap-0">
                {/* External Links */}
                {externalLinks.map((item) => {
                    return (
                        <NavigationMenu.Item key={item.text}>
                            <IconButton
                                aria-label={item.text}
                                size="lg"
                                color="secondary"
                                variant="ghost"
                                render={
                                    <NavigationMenu.Link
                                        render={<Link href={item.url}>{item.icon}</Link>}
                                        className="p-0"
                                    />
                                }
                            />
                        </NavigationMenu.Item>
                    );
                })}

                {/* Divider */}
                <div
                    style={{
                        strokeWidth: '1px',
                        stroke: 'var(--vapor-color-border-normal, #E1E1E8)',
                        width: '0',
                        height: 'var(--vapor-size-dimension-400, 32px)',
                    }}
                    className="border-l mx-2"
                />

                {/* Theme Toggle */}
                <NavigationMenu.Item>
                    <ThemeToggle />
                </NavigationMenu.Item>
            </NavigationMenu.List>
        </NavigationMenu.Root>
    );
};
const MobileNavigation = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
            <div className="flex flex-1 justify-end items-center gap-v-50">
                <ThemeToggle size="lg" color="secondary" variant="ghost" />
                <Dialog.Trigger asChild>
                    <IconButton
                        size="lg"
                        color="secondary"
                        variant="fill"
                        className="md:hidden"
                        aria-label="menu"
                    >
                        <MenuOutlineIcon />
                    </IconButton>
                </Dialog.Trigger>
            </div>

            <Dialog.Portal>
                {/* Mobile Overlay */}
                <Dialog.Overlay className="fixed z-10 inset-0 bg-black/40 md:hidden" />

                {/* Mobile Menu Content */}
                <Dialog.Content
                    className="fixed inset-y-0 right-0 w-[300px] bg-[var(--vapor-color-background-canvas)] shadow-lg flex flex-col  md:hidden focus:outline-none z-50"
                    onEscapeKeyDown={() => setIsOpen(false)}
                    onPointerDownOutside={() => setIsOpen(false)}
                >
                    <Dialog.Title className="sr-only">Mobile navigation menu</Dialog.Title>

                    {/* Mobile Menu Header */}
                    <div className="flex justify-end px-6 py-4">
                        <Dialog.Close asChild>
                            <IconButton color="secondary" variant="ghost" aria-label="close">
                                <CloseOutlineIcon size={20} />
                            </IconButton>
                        </Dialog.Close>
                    </div>

                    {/* Mobile Menu Items */}
                    <ul className="flex flex-col gap-4 p-6">
                        {/* External Links */}
                        {externalLinks.map((item, i) => (
                            <li key={i} className="flex h-10 px-6 items-center justify-between">
                                <Text
                                    className="flex items-center gap-2 text-base"
                                    onClick={() => setIsOpen(false)}
                                    render={<h6 />}
                                >
                                    {item.type === 'icon' ? item.icon : null}
                                    {hasText(item) ? item.text : null}
                                </Text>
                                <IconButton
                                    size="md"
                                    color="secondary"
                                    variant="fill"
                                    aria-label={hasUrl(item) ? item.url : ''}
                                >
                                    <Link href={hasUrl(item) ? item.url : '#'}>
                                        <OpenInNewOutlineIcon />
                                    </Link>
                                </IconButton>
                            </li>
                        ))}
                    </ul>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};

export const SiteNavBar = () => {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const header = document.querySelector('header');
            const headerHeight = header?.offsetHeight || 60;
            const headerHalfHeight = headerHeight / 2;
            setIsScrolled(scrollTop > headerHalfHeight);
        };

        // 초기 스크롤 위치 체크
        handleScroll();

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header
            className={`z-10 flex w-full py-3 px-4 md:px-8 gap-v-500 items-center fixed top-0 transition-[background-color,box-shadow,backdrop-filter] duration-500 ${
                isScrolled
                    ? 'bg-[var(--vapor-color-background-canvas)] shadow-lg backdrop-blur-sm z-20'
                    : 'bg-transparent'
            }`}
        >
            {/* Logo */}
            <Link
                href="/"
                className="inline-flex items-center gap-2.5 font-semibold text-[var(--vapor-color-logo-normal)]"
            >
                <LogoVapor
                    width={68}
                    height={24}
                    role="img"
                    aria-label="Goorm Design System: Vapor"
                />
            </Link>

            <div className="hidden md:flex flex-1">
                <WebNavigation />
            </div>

            <div className="flex md:hidden flex-1">
                <MobileNavigation />
            </div>
        </header>
    );
};

export default SiteNavBar;
