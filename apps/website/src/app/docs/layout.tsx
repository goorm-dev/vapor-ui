import type { ReactNode } from 'react';

import { DocPageClient } from './doc-page-client';
import { DocsLayout } from 'fumadocs-ui/layouts/notebook';

import { docsOptions } from '~/app/layout.config';

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
