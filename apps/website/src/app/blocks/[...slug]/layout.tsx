import { notFound } from 'next/navigation';

import { BlockPageLayout } from '~/components/block-page-layout';
import { createMetadata } from '~/lib/metadata';
import { blockSource } from '~/lib/source';

export default function Layout({ children }: { children: React.ReactNode }) {
    return <BlockPageLayout>{children}</BlockPageLayout>;
}

export async function generateMetadata(props: { params: Promise<{ slug?: string[] }> }) {
    const { slug = [] } = await props.params;

    const page = blockSource.getPage(slug);
    if (!page) notFound();
    const image = 'https://statics.goorm.io/gds/docs/og-image/logo/og-vapor-1.png';
    return createMetadata({
        title: `${page.data.title} - Vapor UI`,
        description: page.data.description,
        openGraph: {
            images: image,
        },
        twitter: {
            card: 'summary_large_image',
            images: image,
        },
    });
}
