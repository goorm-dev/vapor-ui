import { source } from '~/lib/source';
import { getLLMTextWithSubpages, isSubpage } from '~/utils/get-llm-text';

export const revalidate = false;

export async function GET() {
    const pages = source.getPages().filter((page) => !isSubpage(page));
    const scanned = await Promise.all(pages.map((page) => getLLMTextWithSubpages(page, 'docs')));

    return new Response(scanned.join('\n\n'));
}
