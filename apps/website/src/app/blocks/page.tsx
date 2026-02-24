'use client';

import { BlockCard } from '~/components/block-card';
import { BlocksPageHeader } from '~/components/blocks-page-header';
import { SiteNavBar } from '~/components/site-nav-bar/site-nav-bar';
import { ALL_BLOCKS } from '~/constants/blocks';

export default function BlocksPage() {
    return (
        <main>
            <SiteNavBar />
            <div className="pt-[62px]">
                <div className="flex flex-col py-[100px] px-[146px] gap-[100px] max-lg:pt-v-900 max-lg:px-v-400 max-lg:gap-v-900 max-sm:py-v-800 max-sm:gap-v-400">
                    <BlocksPageHeader />

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-v-400 [&>*]:min-h-[263px]">
                        {ALL_BLOCKS.map((block) => (
                            <BlockCard key={block.id} {...block} />
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}
