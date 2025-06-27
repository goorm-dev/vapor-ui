import type { DocsLayoutProps } from 'fumadocs-ui/layouts/docs';
import type { DocsLayoutProps as NotebookLayoutProps } from 'fumadocs-ui/layouts/notebook';
import type { BaseLayoutProps, LinkItemType } from 'fumadocs-ui/layouts/shared';
import Image from 'next/image';

import { SiteNavBar } from '~/components/site-nav-bar/site-nav-bar';
import { source } from '~/lib/source';

export const navLinks = [
    {
        icon: (
            <div className="relative inline-block w-5 h-5">
                <Image
                    src="/icons/figma-color.svg"
                    alt="Figma"
                    fill
                    style={{ objectFit: 'contain' }}
                />
            </div>
        ),
        text: 'Figma',
        url: 'https://www.figma.com/community/file/1508829832204351721/vapor-design-system',
        label: 'Vapor figma comunity file',
        type: 'icon',
    },
    {
        icon: (
            <div className="relative inline-block w-5 h-5">
                <Image
                    src="/icons/discord-color.svg"
                    alt="Discord"
                    fill
                    style={{ objectFit: 'contain' }}
                />
            </div>
        ),
        text: 'Discord',
        url: 'https://discord.gg/7Z8Ecur63D',
        label: 'Vapor Discord comunity',
        type: 'icon',
    },
    {
        icon: (
            <div className="relative inline-block w-5 h-5">
                <Image
                    src="/icons/github-color.svg"
                    alt="Github"
                    fill
                    style={{ objectFit: 'contain' }}
                />
            </div>
        ),
        text: 'Github',
        url: 'https://github.com/goorm-dev/vapor-ui',
        label: 'Vapor Github',
        type: 'icon',
    },
    {
        text: 'Docs',
        url: '/docs',
        active: 'nested-url',
    },
    {
        text: 'Playground',
        url: '/playground',
    },
] as LinkItemType[];

// Logo element used in nav title
const logoTitle = (
    <Image
        width={68}
        height={26}
        src="https://statics.goorm.io/gds/resources/brand-images/light/logo_vapor.svg"
        alt="Goorm Design System: Vapor"
    />
);

// nav object needs to be mutable to assign component afterwards
const nav: BaseLayoutProps['nav'] = {
    title: logoTitle,
    component: <SiteNavBar title={logoTitle} links={navLinks} />, // will be assigned below
};

// Assign the actual component now that nav object exists

export const baseOptions: BaseLayoutProps = {
    nav,
    githubUrl: 'https://github.com/goorm-dev/gds',
};

export const docsOptions: DocsLayoutProps = {
    ...baseOptions,
    tree: source.pageTree,
};

export const playgroundOptions: NotebookLayoutProps = {
    ...baseOptions,
    tree: source.pageTree,
    tabMode: 'sidebar',
};
