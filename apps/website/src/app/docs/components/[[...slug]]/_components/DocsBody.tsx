'use client';

import type { ComponentProps } from 'react';

import { DocsBody as FumaDocsBody } from 'fumadocs-ui/page';

interface DocsBodyProps extends ComponentProps<'div'> {}

export const DocsBody = (props: DocsBodyProps) => {
    return <FumaDocsBody {...props} />;
};
