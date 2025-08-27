'use client';

import { Badge, Text } from '@vapor-ui/core';

import ComponentsCard from '~/components/component-card/component-card';
import { SiteNavBar } from '~/components/site-nav-bar/site-nav-bar';
import { NAVBAR_BLOCK_URL, SIDEBAR_BLOCK_URL } from '~/constants/image-urls';

const blocks = [
    {
        id: 'nav-bar',
        name: 'Navbar',
        description: 'NavBar는 사이트 상단에 위치하는 전역 내비게이션 컴포넌트입니다.',
        href: '/blocks/nav-bar',
        imageUrl: NAVBAR_BLOCK_URL,
    },
    {
        id: 'side-bar',
        name: 'Sidebar',
        description: '화면의 좌측 또는 우측에 위치하는 네비게이션 컴포넌트입니다.',
        href: '/blocks/side-bar',
        imageUrl: SIDEBAR_BLOCK_URL, // placeholder
    },
];

export default function BlocksPage() {
    return (
        <div>
            <SiteNavBar />
            <main className="pt-[62px]">
                <div className="flex flex-col py-[100px] px-[146px] gap-[100px] max-[1440px]:py-[100px] max-[1440px]:px-[var(--size-size-space-400,32px)] max-lg:gap-[var(--vapor-size-space-900)] max-[1200px]:py-[var(--vapor-size-space-900)] max-[768px]:py-[var(--vapor-size-space-800)] max-[768px]:gap-[var(--vapor-size-space-400)]">
                    <div>
                        <div className="flex flex-col gap-[var(--vapor-size-space-150)] items-start">
                            <div className="flex flex-col gap-[var(--vapor-size-space-150)] items-start w-full">
                                <Badge color="hint" shape="pill" size="lg">
                                    UI Blocks
                                </Badge>
                            </div>
                            <div className="flex flex-col gap-[var(--vapor-size-space-200)] items-start">
                                {/* Desktop (≥1200px) */}
                                <Text typography="display4" asChild className="lg:block hidden">
                                    <h1>
                                        Build pages faster
                                        <br />
                                        with ready-to-use UI blocks
                                    </h1>
                                </Text>
                                {/* Tablet (992px-1199px) */}
                                <Text
                                    typography="heading1"
                                    asChild
                                    className="md:max-lg:block hidden"
                                >
                                    <h1>
                                        Build pages faster
                                        <br />
                                        with ready-to-use UI blocks
                                    </h1>
                                </Text>
                                {/* Mobile Large (768px-991px) */}
                                <Text
                                    typography="heading2"
                                    asChild
                                    className="sm:max-md:block hidden"
                                >
                                    <h1>
                                        Build pages faster
                                        <br />
                                        with ready-to-use UI blocks
                                    </h1>
                                </Text>
                                {/* Mobile Small (<768px) */}
                                <Text
                                    typography="heading3"
                                    asChild
                                    className="max-sm:block sm:hidden"
                                >
                                    <h1>
                                        Build pages faster
                                        <br />
                                        with ready-to-use UI blocks
                                    </h1>
                                </Text>
                                <Text typography="body1" foreground="normal">
                                    UI 블록은 불필요한 과정을 줄이고 협업을 원활하게 하여,
                                    <br />
                                    누구나 빠르고 쉽게 완성도 높은 경험을 제공할 수 있도록 돕습니다
                                </Text>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[var(--vapor-size-space-400)] min-[1440px]:[&>*]:h-[263px] max-[992px]:gap-[var(--vapor-size-space-300)] max-[768px]:gap-[var(--vapor-size-space-400)]">
                        {blocks.map((block) => (
                            <ComponentsCard
                                key={block.id}
                                imageUrl={block.imageUrl}
                                alt={block.name}
                                name={block.name}
                                description={block.description}
                                href={block.href}
                            />
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
