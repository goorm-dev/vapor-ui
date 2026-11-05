import { notFound } from 'next/navigation';
import { type NextRequest, NextResponse } from 'next/server';

import { source } from '~/lib/source';
import { getLLMTextWithProperties, isPropertiesPage } from '~/utils/get-llm-text';

export const revalidate = false;

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug?: string[] }> }) {
    const { slug } = await params;
    const page = source.getPage(slug);

    if (!page) notFound();
    if (isPropertiesPage(page)) {
        const parent = source.getPage(page.slugs.slice(0, -1));
        if (parent) return new NextResponse(await getLLMTextWithProperties(parent, 'docs'));
    }

    return new NextResponse(await getLLMTextWithProperties(page, 'docs'));
}

export function generateStaticParams() {
    return source.generateParams().filter((params) => params.slug?.at(-1) !== 'properties');
}
