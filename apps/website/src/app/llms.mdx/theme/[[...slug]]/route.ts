import { notFound } from 'next/navigation';
import { type NextRequest, NextResponse } from 'next/server';

import { themeSource } from '~/lib/source';
import { getLLMText } from '~/utils/get-llm-text';

export const revalidate = false;

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug?: string[] }> }) {
    const { slug } = await params;

    if (!slug || slug.length === 0) {
        notFound();
    }

    const page = themeSource.getPage(slug);

    if (!page) notFound();

    return new NextResponse(await getLLMText(page, 'theme'));
}

export function generateStaticParams() {
    return themeSource.generateParams();
}
