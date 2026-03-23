import type { ReactNode } from 'react';

import clsx from 'clsx';
import { HomeLayout } from 'fumadocs-ui/layouts/home';

import { baseOptions, homeLinks } from '~/app/layout.config';
import { LargeSearchToggle } from '~/components/fumadocs/search-toggle';
import { ThemeToggle } from '~/components/theme-toggle';
import { createMetadata } from '~/utils/metadata';

export const metadata = createMetadata({});

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <HomeLayout
            {...baseOptions}
            links={homeLinks}
            themeSwitch={{ component: <ThemeToggle size="md" /> }}
            searchToggle={{
                components: {
                    lg: (
                        <LargeSearchToggle
                            hideIfDisabled
                            className={clsx(
                                'my-auto w-full max-md:hidden',
                                'max-w-[160px] xl:max-w-2xs rounded-xl ps-2.5',
                            )}
                        />
                    ),
                },
            }}
        >
            {/* <SiteNavBar /> */}

            {children}
        </HomeLayout>
    );
}
