import type { ReactNode } from 'react';

import { DocsLayout } from 'fumadocs-ui/layouts/notebook';

import { docsOptions } from '~/app/layout.config';
import { SiteNavigation } from '~/components/site-nav-bar/navigation-list';
import { VersionSelector } from '~/components/version-selector';

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <DocsLayout
            {...docsOptions}
            tabMode="sidebar"
            nav={{
                ...docsOptions.nav,
                mode: 'top',
                title: docsOptions.nav?.title,
                children: <SiteNavigation leftSlot={<VersionSelector />} className="-mr-2" />,
            }}
            sidebar={{ collapsible: false }}
            themeSwitch={{ enabled: false }}
        >
            {children}
        </DocsLayout>
    );
}
