'use client';

import { type ReactNode, useRef } from 'react';

import type { TableOfContents } from 'fumadocs-core/server';

import { TOC } from '../toc';

interface BlockPageBodyProps {
    children: ReactNode;
    toc?: TableOfContents;
}

export const BlockPageBody = ({ children, toc }: BlockPageBodyProps) => {
    const containerRef = useRef<HTMLDivElement>(null);

    return (
        <div
            ref={containerRef}
            className="prose w-full flex items-start justify-between self-stretch gap-v-500"
        >
            <div className="w-full overflow-auto">{children}</div>
            <TOC toc={toc} containerRef={containerRef} className="max-[1200px]:hidden" />
        </div>
    );
};
