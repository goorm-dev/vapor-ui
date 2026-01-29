import { BlockPageLayout } from '~/components/block-page-layout';
import { blockSource } from '~/lib/source';
import { generatePageMetadata } from '~/utils/metadata';

export default function Layout({ children }: { children: React.ReactNode }) {
    return <BlockPageLayout>{children}</BlockPageLayout>;
}

export async function generateMetadata(props: {
    params: Promise<{ slug?: string[]; lang: string }>;
}) {
    const { slug = [], lang } = await props.params;
    const page = blockSource.getPage(slug, lang);
    return generatePageMetadata(page || null);
}
