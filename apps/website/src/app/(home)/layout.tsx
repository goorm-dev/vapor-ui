import type { ReactNode } from 'react';

import { ThemeProvider } from '@vapor-ui/core';
import { HomeLayout } from 'fumadocs-ui/layouts/home';

import { baseOptions } from '~/app/layout.config';
import { SiteNavBar } from '~/components/site-nav-bar/site-nav-bar';
import { createMetadata } from '~/lib/metadata';

export const metadata = createMetadata({});

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <ThemeProvider
            config={{
                appearance: 'dark',
                storageKey: `theme-home`,
            }}
        >
            <HomeLayout
                {...baseOptions}
                nav={{
                    enabled: false,
                }}
            >
                <SiteNavBar />

                {children}
            </HomeLayout>
        </ThemeProvider>
    );
}
