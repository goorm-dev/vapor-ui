'use client';

import { type RefObject } from 'react';

import { Text } from '@vapor-ui/core';
import clsx from 'clsx';
import type { TableOfContents } from 'fumadocs-core/server';
import * as Base from 'fumadocs-core/toc';

const TOC_CONSTANTS = {
    MIN_DEPTH: 3,
    INDENT_SIZE: 20,
    BASE_PADDING: 12,
} as const;

interface TOCProps {
    toc?: TableOfContents;
    containerRef: RefObject<HTMLElement>;
    className?: string;
}

export const TOC = ({ toc, containerRef, className }: TOCProps) => {
    if (!toc || toc.length === 0) {
        return null;
    }

    return (
        <div className={clsx('sticky top-[62px] w-[200px] shrink-0 not-prose', className)}>
            <Base.AnchorProvider toc={toc}>
                <Base.ScrollProvider containerRef={containerRef}>
                    <nav className="flex flex-col gap-[var(--vapor-size-space-100)]">
                        <Text
                            typography="subtitle1"
                            foreground="normal-200"
                            render={<h4>On this page</h4>}
                        />
                        <ul className="flex flex-col items-start gap-[var(--vapor-size-space-050)]">
                            {toc.map((item) => (
                                <li key={item.url}>
                                    <Text
                                        typography="subtitle1"
                                        foreground="hint-200"
                                        render={
                                            <Base.TOCItem
                                                href={item.url}
                                                className="block h-[var(--vapor-size-dimension-400)] leading-[var(--vapor-size-dimension-400)] hover:text-gray-900 data-[active=true]:text-[var(--vapor-color-foreground-primary-100)] data-[active=true]:font-medium transition-colors"
                                                style={{
                                                    paddingLeft: `${(item.depth - TOC_CONSTANTS.MIN_DEPTH) * TOC_CONSTANTS.INDENT_SIZE + TOC_CONSTANTS.BASE_PADDING}px`,
                                                }}
                                            >
                                                {item.title}
                                            </Base.TOCItem>
                                        }
                                    />
                                </li>
                            ))}
                        </ul>
                    </nav>
                </Base.ScrollProvider>
            </Base.AnchorProvider>
        </div>
    );
};
