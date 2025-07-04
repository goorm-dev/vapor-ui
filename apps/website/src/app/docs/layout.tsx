import type { ReactNode } from 'react';

import { DocsLayout } from 'fumadocs-ui/layouts/notebook';

import { docsOptions } from '~/app/layout.config';

import { DocPageClient } from './doc-page-client';

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <DocsLayout
            {...docsOptions}
            nav={{
                ...docsOptions.nav,
                mode: 'top',
            }}
        >
            <DocPageClient>{children}</DocPageClient>
        </DocsLayout>
    );
}
