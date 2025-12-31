'use client';

import { type ReactNode } from 'react';

import { SiteNavBar } from '~/components/site-nav-bar/site-nav-bar';

interface BlockPageLayoutProps {
    children: ReactNode;
}

export const BlockPageLayout = ({ children }: BlockPageLayoutProps) => {
    return (
        <div>
            <SiteNavBar />
            <main className="mt-[62px] flex flex-col items-start gap-v-900 self-stretch max-[1440px]:px-v-400 max-[1440px]:py-v-900 max-[1440px]:pb-[80px] min-[1440px]:pt-v-900 min-[1440px]:px-[146px] min-[1440px]:pb-[80px]">
                {children}
            </main>
        </div>
    );
};
