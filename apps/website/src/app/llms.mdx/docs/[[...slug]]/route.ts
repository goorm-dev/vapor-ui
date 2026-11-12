import { notFound } from 'next/navigation';
import { type NextRequest, NextResponse } from 'next/server';

import { source } from '~/lib/source';
import { getLLMTextWithSubpages, isSubpage } from '~/utils/get-llm-text';

export const revalidate = false;

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug?: string[] }> }) {
    const { slug } = await params;
    const page = source.getPage(slug);

    if (!page) notFound();
    if (isSubpage(page)) {
        const parent = source.getPage(page.slugs.slice(0, -1));
        if (parent) return new NextResponse(await getLLMTextWithSubpages(parent, 'docs'));
    }

    return new NextResponse(await getLLMTextWithSubpages(page, 'docs'));
}

export function generateStaticParams() {
    return source
        .getPages()
        .filter((page) => !isSubpage(page))
        .map((page) => ({ slug: page.slugs }));
}
