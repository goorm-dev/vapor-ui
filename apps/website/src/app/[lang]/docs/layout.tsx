import type { ReactNode } from 'react';

import { DocsLayout } from 'fumadocs-ui/layouts/notebook';

import { baseOptions, docsOptions } from '~/app/[lang]/layout.config';

export default async function Layout({
    params,
    children,
}: {
    params: Promise<{ lang: string }>;
    children: ReactNode;
}) {
    const { lang } = await params;

    return (
        <DocsLayout
            {...docsOptions(lang)}
            nav={{
                ...baseOptions.nav,
                mode: 'top',
            }}
        >
            {children}
        </DocsLayout>
    );
}
