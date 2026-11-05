import { source } from '~/lib/source';
import { getLLMTextWithProperties, isPropertiesPage } from '~/utils/get-llm-text';

export const revalidate = false;

export async function GET() {
    const pages = source.getPages().filter((page) => !isPropertiesPage(page));
    const scanned = await Promise.all(pages.map((page) => getLLMTextWithProperties(page, 'docs')));

    return new Response(scanned.join('\n\n'));
}
