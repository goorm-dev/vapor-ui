'use client';

import { BlockCard } from '~/components/block-card';
import { BlocksPageHeader } from '~/components/blocks-page-header';
import { SiteNavBar } from '~/components/site-nav-bar/site-nav-bar';
import { ALL_BLOCKS } from '~/constants/blocks';

export default function BlocksPage() {
    return (
        <div>
            <SiteNavBar />
            <main className="pt-[62px]">
                <div className="flex flex-col py-[100px] px-[146px] gap-[100px] max-lg:pt-[var(--vapor-size-space-900)] max-lg:px-[var(--vapor-size-space-400)] max-lg:gap-[var(--vapor-size-space-900)] max-sm:py-[var(--vapor-size-space-800)] max-sm:gap-[var(--vapor-size-space-400)]">
                    <BlocksPageHeader />

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[var(--vapor-size-space-400)] [&>*]:min-h-[263px]">
                        {ALL_BLOCKS.map((block) => (
                            <BlockCard key={block.id} {...block} />
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
