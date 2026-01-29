import type { DocsLayoutProps } from 'fumadocs-ui/layouts/docs';
import type { DocsLayoutProps as NotebookLayoutProps } from 'fumadocs-ui/layouts/notebook';
import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

import { ThemeToggle } from '~/components/theme-toggle';
import { navLinks } from '~/constants/site-links';
import { source } from '~/lib/source';

import LogoVapor from '../../../public/icons/logo-vapor.svg';

export const baseOptions: BaseLayoutProps = {
    nav: {
        title: (
            <LogoVapor width={68} height={24} role="img" aria-label="Goorm Design System: Vapor" />
        ),
    },
    links: navLinks,

    themeSwitch: {
        component: <ThemeToggle />,
    },
};

export function docsOptions(lang: string): DocsLayoutProps {
    return {
        ...baseOptions,
        tree: source.getPageTree(lang),
        sidebar: {
            className: 'md:bg-v-canvas',
        },
    };
}

export function playgroundOptions(lang: string): NotebookLayoutProps {
    return {
        ...baseOptions,
        tree: source.getPageTree(lang),
        tabMode: 'sidebar',
    };
}
