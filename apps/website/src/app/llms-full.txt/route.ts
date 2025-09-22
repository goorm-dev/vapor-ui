import { getLLMText } from '~/lib/get-llm-text';
import { blockSource, source } from '~/lib/source';

export const revalidate = false;

export async function GET() {
    const scan = [{ docs: source.getPages() }, { blocks: blockSource.getPages() }].map(
        async (section) => {
            const key = Object.keys(section)[0];
            const pages = section[key as 'docs' | 'blocks'];
            return Promise.all(
                pages?.map((page) => getLLMText(page, key as 'docs' | 'blocks')) ?? [],
            );
        },
    );
    const scanned = await Promise.all(scan);

    return new Response(scanned.flat().join('\n\n'));
}
