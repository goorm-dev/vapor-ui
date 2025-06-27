import type { DocsLayoutProps } from 'fumadocs-ui/layouts/docs';
import type { DocsLayoutProps as NotebookLayoutProps } from 'fumadocs-ui/layouts/notebook';
import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import Image from 'next/image';

import { source } from '~/lib/source';

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
