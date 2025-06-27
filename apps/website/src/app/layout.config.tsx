import type { DocsLayoutProps } from 'fumadocs-ui/layouts/docs';
import type { DocsLayoutProps as NotebookLayoutProps } from 'fumadocs-ui/layouts/notebook';
import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import Image from 'next/image';

import { navLinks } from '~/constants/site-links';
import { source } from '~/lib/source';

export const baseOptions: BaseLayoutProps = {
    nav: {
        title: (
            <Image
                width={68}
                height={26}
                src="https://statics.goorm.io/gds/resources/brand-images/light/logo_vapor.svg"
                alt="Goorm Design System: Vapor"
            />
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
};

export const playgroundOptions: NotebookLayoutProps = {
    ...baseOptions,
    tree: source.pageTree,
    tabMode: 'sidebar',
};
