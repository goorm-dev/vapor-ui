'use client';

import { Badge, Text } from '@vapor-ui/core';

const ResponsiveTitle = ({ children }: { children: React.ReactNode }) => (
    <>
        {/* Desktop (≥1200px) */}
        <Text typography="display4" render={<h1>{children}</h1>} className="hidden lg:block" />
        {/* Tablet (992px-1199px) */}
        <Text
            typography="heading1"
            render={<h1>{children}</h1>}
            className="hidden md:max-lg:block"
        />
        {/* Mobile Large (768px-991px) */}
        <Text
            typography="heading2"
            render={<h1>{children}</h1>}
            className="hidden sm:max-md:block"
        />
        {/* Mobile Small (<768px) */}
        <Text typography="heading3" render={<h1>{children}</h1>} className="block sm:hidden" />
    </>
);

export const BlocksPageHeader = () => (
    <div className="flex flex-col gap-[var(--vapor-size-space-150)] items-start">
        <div className="flex flex-col gap-[var(--vapor-size-space-150)] items-start w-full">
            <Badge color="hint" shape="pill" size="lg">
                UI Blocks
            </Badge>
        </div>
        <div className="flex flex-col gap-[var(--vapor-size-space-200)] items-start">
            <ResponsiveTitle>
                Build pages faster
                <br />
                with ready-to-use UI blocks
            </ResponsiveTitle>
            <Text typography="body1" foreground="normal">
                UI 블록은 불필요한 과정을 줄이고 협업을 원활하게 하여,
                <br />
                누구나 빠르고 쉽게 완성도 높은 경험을 제공할 수 있도록 돕습니다
            </Text>
        </div>
    </div>
);
