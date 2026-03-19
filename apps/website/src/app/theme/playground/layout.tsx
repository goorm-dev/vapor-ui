import type { ReactNode } from 'react';

import { HomeLayout } from 'fumadocs-ui/layouts/home';
import type { Metadata } from 'next';

import { baseOptions, homeLinks } from '~/app/layout.config';
import { ThemeToggle } from '~/components/theme-toggle';

import { ThemePanel } from './_components/theme-panel';

export const metadata: Metadata = {
    title: 'Theme Playground - Vapor UI',
};

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <HomeLayout
            {...baseOptions}
            links={homeLinks}
            themeSwitch={{ component: <ThemeToggle size="md" /> }}
        >
            <ThemePanel />

            {children}
        </HomeLayout>
    );
}
