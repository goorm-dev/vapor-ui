'use client';

import React from 'react';
import type { ReactNode } from 'react';

const IntroLinkCardContainer = ({ children }: { children: ReactNode }) => {
    return <div className="flex flex-row gap-[var(--vapor-size-space-400)]">{children}</div>;
};

export default IntroLinkCardContainer;
