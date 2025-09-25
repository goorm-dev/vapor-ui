import type { DocsLayoutProps } from 'fumadocs-ui/layouts/docs';
import type { DocsLayoutProps as NotebookLayoutProps } from 'fumadocs-ui/layouts/notebook';
import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

import { navLinks } from '~/constants/site-links';
import { source } from '~/lib/source';

import LogoVapor from '../../public/icons/logo-vapor.svg';

export const baseOptions: BaseLayoutProps = {
    nav: {
        title: (
            <LogoVapor width={68} height={24} role="img" aria-label="Goorm Design System: Vapor" />
        ),
    },
    links: navLinks,
    themeSwitch: {
        enabled: false,
    },
};

export const docsOptions: DocsLayoutProps = {
    ...baseOptions,
    tree: source.pageTree,
    sidebar: {
        className: 'md:bg-[var(--vapor-color-background-canvas)]',
    },
};

export const playgroundOptions: NotebookLayoutProps = {
    ...baseOptions,
    tree: source.pageTree,
    tabMode: 'sidebar',
};
