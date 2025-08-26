'use client';

import { useState } from 'react';

import * as Dialog from '@radix-ui/react-dialog';
import { IconButton, Nav, Text } from '@vapor-ui/core';
import { CloseOutlineIcon, MenuOutlineIcon, OpenInNewOutlineIcon } from '@vapor-ui/icons';
import Link from 'fumadocs-core/link';
import type { LinkItemType } from 'fumadocs-ui/layouts/shared';
import { usePathname } from 'next/navigation';

import { externalLinks } from '~/constants/site-links';

import LogoVapor from '../../../public/icons/logo-vapor.svg';

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

export const SiteNavBar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    return (
        <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
            <header className="flex z-10 w-full py-3 px-4 md:px-8 justify-between items-center h-[62px] fixed top-[var(--fd-banner-height)] bg-fd-background">
                <div className="flex items-center gap-10 relative w-full">
                    <Nav.Root
                        aria-label="Main"
                        size="lg"
                        shape="ghost"
                        className="flex justify-between items-center gap-10 w-full"
                    >
                        <div className="flex items-center gap-10">
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

                            <Nav.List className="hidden md:flex flex-row items-center gap-2 p-0 h-full">
                                <Nav.LinkItem href="/docs" active={pathname.includes('/docs')}>
                                    <Text
                                        typography="subtitle1"
                                        foreground={
                                            pathname.includes('/docs') ? 'primary' : 'secondary'
                                        }
                                    >
                                        Docs
                                    </Text>
                                </Nav.LinkItem>
                                <Nav.LinkItem
                                    href="/playground"
                                    active={pathname.includes('/playground')}
                                >
                                    <Text
                                        typography="subtitle1"
                                        foreground={
                                            pathname.includes('/playground')
                                                ? 'primary'
                                                : 'secondary'
                                        }
                                    >
                                        Playground
                                    </Text>
                                </Nav.LinkItem>
                                <Nav.LinkItem href="/blocks" active={pathname.includes('/blocks')}>
                                    <Text
                                        typography="subtitle1"
                                        foreground={
                                            pathname.includes('/blocks') ? 'primary' : 'secondary'
                                        }
                                    >
                                        UI Blocks
                                    </Text>
                                </Nav.LinkItem>
                            </Nav.List>
                        </div>
                        <div className="flex items-center gap-10">
                            <Nav.List className="hidden md:flex flex-row items-center gap-0">
                                {externalLinks.map((item) => {
                                    return (
                                        <Nav.Item key={item.text}>
                                            <IconButton
                                                asChild
                                                size="lg"
                                                color="secondary"
                                                variant="ghost"
                                                aria-label={item.text}
                                            >
                                                <Nav.Link asChild className="p-0">
                                                    <Link href={item.url}>{item.icon}</Link>
                                                </Nav.Link>
                                            </IconButton>
                                        </Nav.Item>
                                    );
                                })}
                            </Nav.List>
                        </div>
                    </Nav.Root>
                </div>
                <Dialog.Trigger asChild>
                    <IconButton
                        size="md"
                        color="secondary"
                        variant="fill"
                        className="md:hidden"
                        aria-label="menu"
                    >
                        <MenuOutlineIcon />
                    </IconButton>
                </Dialog.Trigger>
            </header>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed z-10 inset-0 bg-black/40 md:hidden" />

                <Dialog.Content
                    className="fixed z-10 inset-y-0 right-0 w-[300px] bg-[var(--vapor-color-background-normal)] shadow-lg flex flex-col  md:hidden focus:outline-none"
                    onEscapeKeyDown={() => setIsOpen(false)}
                    onPointerDownOutside={() => setIsOpen(false)}
                >
                    <Dialog.Title className="sr-only">Mobile navigation menu</Dialog.Title>
                    <header className="flex justify-end px-6 py-4">
                        <Dialog.Close asChild>
                            <IconButton color="secondary" variant="ghost" aria-label="close">
                                <CloseOutlineIcon size={20} />
                            </IconButton>
                        </Dialog.Close>
                    </header>
                    <ul className="flex flex-col gap-4 p-6">
                        {externalLinks.map((item, i) => (
                            <li key={i} className="flex h-10 px-6 items-center justify-between">
                                <Text
                                    className="flex items-center gap-2 text-base"
                                    onClick={() => setIsOpen(false)}
                                    asChild
                                >
                                    <h6>
                                        {item.type === 'icon' ? item.icon : null}
                                        {hasText(item) ? item.text : null}
                                    </h6>
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

export default SiteNavBar;
