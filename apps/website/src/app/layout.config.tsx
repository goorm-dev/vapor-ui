import type { DocsLayoutProps } from 'fumadocs-ui/layouts/docs';
import type { DocsLayoutProps as NotebookLayoutProps } from 'fumadocs-ui/layouts/notebook';
import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import Image from 'next/image';

import { source } from '~/lib/source';

/**
 * Shared layout configurations
 *
 * you can customise layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */
export const baseOptions: BaseLayoutProps = {
    nav: {
        title: (
            <>
                <Image
                    width={68}
                    height={26}
                    src="https://statics.goorm.io/gds/resources/brand-images/light/logo_vapor.svg"
                    alt="Goorm Design System: Vapor"
                />
            </>
        ),
    },
    links: [
        {
            icon: (
                <Image
                    src="/icons/figma-color.svg"
                    alt="Figma"
                    width={16}
                    height={16}
                    style={{ display: 'inline-block' }}
                />
            ),
            text: 'Figma',
            url: 'https://www.figma.com/community/file/1508829832204351721/vapor-design-system',
            label: 'Vapor figma comunity file',
            type: 'icon',
        },
        {
            icon: (
                <Image
                    src="/icons/discord-color.svg"
                    alt="Discord"
                    width={16}
                    height={16}
                    style={{ display: 'inline-block' }}
                />
            ),
            text: 'Discord',
            url: 'https://discord.gg/7Z8Ecur63D',
            label: 'Vapor Discord comunity',
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
    ],
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
