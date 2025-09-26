import { notFound } from 'next/navigation';
import { type NextRequest, NextResponse } from 'next/server';

import { blockSource } from '~/lib/source';
import { getBlocksIndexContent } from '~/service/getBlocksIndexContent';
import { getLLMText } from '~/utils/get-llm-text';

export const revalidate = false;

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug?: string[] }> }) {
    const { slug } = await params;

    // /blocks 메인 페이지 처리 (slug가 없거나 빈 배열인 경우)
    if (!slug || slug.length === 0) {
        const content = await getBlocksIndexContent();
        return new NextResponse(content);
    }

    const page = blockSource.getPage(slug);

    if (!page) notFound();

    return new NextResponse(await getLLMText(page, 'blocks'));
}

export function generateStaticParams() {
    return blockSource.generateParams();
}
