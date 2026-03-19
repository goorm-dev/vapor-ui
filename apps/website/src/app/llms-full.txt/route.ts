import { source } from '~/lib/source';
import { getLLMText } from '~/utils/get-llm-text';

export const revalidate = false;

export async function GET() {
    const pages = source.getPages();
    const scanned = await Promise.all(pages.map((page) => getLLMText(page, 'docs')));

    return new Response(scanned.join('\n\n'));
}
