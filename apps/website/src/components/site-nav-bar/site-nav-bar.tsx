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
import { SiteNavigation } from './navigation-list';

function hasText(item: LinkItemType): item is LinkItemType & { text: string } {
    return 'text' in item && typeof (item as { text?: unknown }).text === 'string';
}

function hasUrl(item: LinkItemType): item is LinkItemType & { url: string } {
    return 'url' in item && typeof (item as { url?: unknown }).url === 'string';
}

const WebNavigation = () => {
    const pathname = usePathname();

    return (
        <SiteNavigation
            className="border-b border-b-transparent"
            leftSlot={
                <NavigationMenu.Link
                    href={'/docs'}
                    current={pathname.includes('/docs')}
                    render={
                        <Text
                            key={'docs'}
                            render={<Link href={'/docs'}>{'Docs'}</Link>}
                            typography="subtitle1"
                            className="text-v-hint-100 hover:text-v-gray-400 transition-colors"
                        >
                            {'Docs'}
                        </Text>
                    }
                />
            }
        />
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
                        colorPalette="secondary"
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
                    className="fixed inset-y-0 right-0 w-[300px] bg-v-canvas-100 shadow-lg flex flex-col  md:hidden focus:outline-none z-50"
                    onEscapeKeyDown={() => setIsOpen(false)}
                    onPointerDownOutside={() => setIsOpen(false)}
                >
                    <Dialog.Title className="sr-only">Mobile navigation menu</Dialog.Title>

                    {/* Mobile Menu Header */}
                    <div className="flex justify-end px-6 py-4">
                        <Dialog.Close asChild>
                            <IconButton colorPalette="secondary" variant="ghost" aria-label="close">
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
                                    colorPalette="secondary"
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
            className={`flex w-full h-16 md:px-8 gap-v-500 items-center fixed top-0 left-0 right-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-500 ${
                isScrolled ? 'shadow-sm backdrop-blur-md' : 'bg-transparent'
            }`}
        >
            {/* Logo */}
            <Link href="/" className="inline-flex items-center gap-2.5 font-semibold text-v-logo">
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
