import { blockSource, source } from '~/lib/source';
import { getLLMText } from '~/utils/get-llm-text';

export const revalidate = false;

export async function GET() {
    const scan = [
        {
            type: 'docs' as const,
            pages: source.getPages(),
        },
        {
            type: 'blocks' as const,
            pages: blockSource.getPages(),
        },
    ].map(async ({ type, pages }) => {
        return Promise.all(pages.map((page) => getLLMText(page, type)) ?? []);
    });

    const scanned = await Promise.all(scan);

    return new Response(scanned.flat().join('\n\n'));
}
