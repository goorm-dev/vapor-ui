'use client';

import { type ReactNode } from 'react';

import { SiteNavBar } from '~/components/site-nav-bar/site-nav-bar';

type BlockPageLayoutProps = {
    children: ReactNode;
};

export const BlockPageLayout = ({ children }: BlockPageLayoutProps) => {
    return (
        <div>
            <SiteNavBar />
            <main className="mt-[62px] flex flex-col items-start gap-[var(--size-size-space-900,72px)] self-stretch max-[1440px]:px-[var(--size-size-space-400,32px)] max-[1440px]:py-[var(--size-size-space-900,72px)] max-[1440px]:pb-[80px] min-[1440px]:pt-[var(--vapor-size-space-900)] min-[1440px]:px-[146px] min-[1440px]:pb-[80px]">
                {children}
            </main>
        </div>
    );
};
