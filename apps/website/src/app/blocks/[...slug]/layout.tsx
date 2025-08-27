import { BlockPageLayout } from '~/components/block-page-layout';
import { generatePageMetadata } from '~/lib/metadata';
import { blockSource } from '~/lib/source';

export default function Layout({ children }: { children: React.ReactNode }) {
    return <BlockPageLayout>{children}</BlockPageLayout>;
}

export async function generateMetadata(props: { params: Promise<{ slug?: string[] }> }) {
    const { slug = [] } = await props.params;
    const page = blockSource.getPage(slug);
    return generatePageMetadata(page || null);
}
