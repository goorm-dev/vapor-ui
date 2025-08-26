'use client';

import { type ReactNode, useRef } from 'react';

import type { TableOfContents } from 'fumadocs-core/server';

import { TOC } from '../toc';

type BlockPageBodyProps = {
    children: ReactNode;
    toc?: TableOfContents;
};

export const BlockPageBody = ({ children, toc }: BlockPageBodyProps) => {
    const containerRef = useRef<HTMLDivElement>(null);

    return (
        <div
            ref={containerRef}
            className="prose w-full flex items-start justify-between self-stretch gap-[var(--vapor-size-space-500)]"
        >
            <div className="w-full overflow-auto">{children}</div>
            {toc && <TOC toc={toc} containerRef={containerRef} className="max-[1200px]:hidden" />}
        </div>
    );
};
