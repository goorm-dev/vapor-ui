import type { DocsLayoutProps } from 'fumadocs-ui/layouts/docs';
import type { BaseLayoutProps, LinkItemType } from 'fumadocs-ui/layouts/shared';

import { source } from '~/lib/source';

import LogoVapor from '../../public/icons/logo-vapor.svg';

export const baseOptions: BaseLayoutProps = {
    nav: {
        transparentMode: 'always',
        title: (
            <LogoVapor width={68} height={24} role="img" aria-label="Goorm Design System: Vapor" />
        ),
    },
};

export const homeLinks: LinkItemType[] = [
    { text: 'Getting Started', url: '/docs/getting-started' },
    { text: 'Components', url: '/docs/components' },
    { text: 'Resources', url: '/docs/resources' },
];

export const docsOptions: DocsLayoutProps = {
    ...baseOptions,
    tree: source.pageTree,
    sidebar: {
        className: 'md:bg-v-canvas',
    },
    containerProps: {
        className: 'isolate',
    },
};
