'use client';

import { Badge, Text } from '@vapor-ui/core';

import ComponentsCard from '~/components/component-card/component-card';
import { SiteNavBar } from '~/components/site-nav-bar/site-nav-bar';
import { FORM_BLOCK_URL, NAVBAR_BLOCK_URL } from '~/constants/image-urls';

const blocks = [
    {
        id: 'nav-bar',
        name: 'Navbar',
        description: 'NavBar는 사이트 상단에 위치하는 전역 내비게이션 컴포넌트입니다.',
        href: '/blocks/nav-bar',
        imageUrl: NAVBAR_BLOCK_URL,
    },
    {
        id: 'form',
        name: 'Form',
        description: 'Form은 사용자가 데이터를 입력하고 제출할 수 있는 인터페이스를 제공합니다.',
        href: '/blocks/form',
        imageUrl: FORM_BLOCK_URL,
    },
];

export default function BlocksPage() {
    return (
        <div>
            <SiteNavBar />
            <main className="pt-[62px]">
                <div className="flex flex-col py-[100px] px-[146px] gap-[100px] max-lg:pt-[var(--vapor-size-space-900)] max-lg:px-[var(--vapor-size-space-400)] max-lg:gap-[var(--vapor-size-space-900)] max-sm:py-[var(--vapor-size-space-800)] max-sm:gap-[var(--vapor-size-space-400)]">
                    <div>
                        <div className="flex flex-col gap-[var(--vapor-size-space-150)] items-start">
                            <div className="flex flex-col gap-[var(--vapor-size-space-150)] items-start w-full">
                                <Badge color="hint" shape="pill" size="lg">
                                    UI Blocks
                                </Badge>
                            </div>
                            <div className="flex flex-col gap-[var(--vapor-size-space-200)] items-start">
                                {/* Desktop (≥1200px) */}
                                <Text
                                    typography="display4"
                                    render={
                                        <h1>
                                            Build pages faster
                                            <br />
                                            with ready-to-use UI blocks
                                        </h1>
                                    }
                                    className="hidden lg:block "
                                />

                                {/* Tablet (992px-1199px) */}
                                <Text
                                    typography="heading1"
                                    render={
                                        <h1>
                                            Build pages faster
                                            <br />
                                            with ready-to-use UI blocks
                                        </h1>
                                    }
                                    className="hidden md:max-lg:block "
                                />
                                {/* Mobile Large (768px-991px) */}
                                <Text
                                    typography="heading2"
                                    render={
                                        <h1>
                                            Build pages faster
                                            <br />
                                            with ready-to-use UI blocks
                                        </h1>
                                    }
                                    className="hidden sm:max-md:block"
                                />
                                {/* Mobile Small (<768px) */}
                                <Text
                                    typography="heading3"
                                    render={
                                        <h1>
                                            Build pages faster
                                            <br />
                                            with ready-to-use UI blocks
                                        </h1>
                                    }
                                    className="block sm:hidden"
                                />
                                <Text typography="body1" foreground="normal">
                                    UI 블록은 불필요한 과정을 줄이고 협업을 원활하게 하여,
                                    <br />
                                    누구나 빠르고 쉽게 완성도 높은 경험을 제공할 수 있도록 돕습니다
                                </Text>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:max-lg:grid-cols-2 lg:max-xxl:grid-cols-3 min-xxl:grid-cols-4 gap-[var(--vapor-size-space-400)] min-[1440px]:[&>*]:h-[263px] max-md:gap-[var(--vapor-size-space-300)] max-sm:gap-[var(--vapor-size-space-400)]">
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
