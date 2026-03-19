import type { Page, PageData } from 'fumadocs-core/source';

import { source } from '~/lib/source';

export const revalidate = false;

function processPages<T extends Page<PageData>>(pages: T[], sectionTitle: string) {
    const scanned: string[] = [];
    const map = new Map<string, string[]>();

    scanned.push(`# ${sectionTitle}`);

    for (const page of pages) {
        const dir = page.slugs[0] || 'index';
        const list = map.get(dir) ?? [];

        list.push(`- [${page.data.title}](${page.url}.mdx): ${page.data.description || ''}`);
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

    return new Response(result.join('\n\n'));
}
