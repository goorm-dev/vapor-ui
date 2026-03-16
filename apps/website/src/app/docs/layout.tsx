import type { ReactNode } from 'react';

import { baseOptions } from '~/app/layout.config';
import { CustomDocsLayout } from '~/components/fumadocs/docs-layout';
import { ThemeToggle } from '~/components/theme-toggle';
import { VersionSelector } from '~/components/version-selector';
import { navLinks } from '~/constants/site-links';
import { source } from '~/lib/source';

const tabs = [
    { title: 'Getting Started', url: '/docs' },
    { title: 'Components', url: '/docs/components' },
    { title: 'Style', url: '/docs/foundations' },
    { title: 'Blocks', url: '/blocks' },
    { title: 'Theme', url: '/theme' },
];

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <CustomDocsLayout
            {...baseOptions}
            tabMode="navbar"
            nav={{
                mode: 'top',
                title: baseOptions.nav?.title,
            }}
            searchToggle={{ enabled: true }}
            themeSwitch={{ component: <ThemeToggle size="md" /> }}
            versionSelector={{ component: <VersionSelector /> }}
            containerProps={{ className: 'isolate' }}
            tree={source.pageTree}
            sidebar={{
                tabs,
            }}
            links={navLinks}
        >
            {children}
        </CustomDocsLayout>
    );
}
