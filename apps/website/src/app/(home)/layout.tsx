import type { ReactNode } from 'react';

import { HomeLayout } from 'fumadocs-ui/layouts/home';

import { baseOptions, homeLinks } from '~/app/layout.config';
import { ThemeToggle } from '~/components/theme-toggle';
import { createMetadata } from '~/utils/metadata';

export const metadata = createMetadata({});

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <HomeLayout
            {...baseOptions}
            links={homeLinks}
            themeSwitch={{ component: <ThemeToggle size="md" /> }}
        >
            {/* <SiteNavBar /> */}

            {children}
        </HomeLayout>
    );
}
