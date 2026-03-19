import { blockSource, source } from '~/lib/source';

export const revalidate = false;

function processPages<
    T extends { slugs: string[]; data: { title: string; description?: string }; url: string },
>(pages: T[], sectionTitle: string) {
    const scanned: string[] = [];
    scanned.push(`# ${sectionTitle}`);
    const map = new Map<string, string[]>();

    for (const page of pages) {
        const dir = page.slugs[0] || 'index';
        const list = map.get(dir) ?? [];
        list.push(`- [${page.data.title}](${page.url}.mdx): ${page.data.description}`);
        map.set(dir, list);
    }

    for (const [key, value] of map) {
        scanned.push(`## ${key}`);
        scanned.push(value.join('\n'));
    }

    return scanned;
}

export async function GET() {
    const result: string[] = [];

    // Process docs
    const docsPages = source.getPages();
    result.push(...processPages(docsPages, 'Docs'));

    // Process blocks
    const blocksPages = blockSource.getPages();
    result.push(...processPages(blocksPages, 'Blocks'));

    return new Response(result.join('\n\n'));
}
