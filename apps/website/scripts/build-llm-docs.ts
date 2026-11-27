/**
 * Writes every page under content/docs as markdown (prose, demo code, props
 * tables) to <outDir>, at the page's URL path: /docs/components/button →
 * <outDir>/components/button.md. `@vapor-ui/core` runs this on prepack to ship
 * its docs in the npm package.
 *
 *   tsx scripts/build-llm-docs.ts <outDir>
 */
import fs from 'node:fs';
import { register } from 'node:module';
import path from 'node:path';

// The foundation pages read token data from @vapor-ui/core, whose entry also
// imports its CSS. Node can't load CSS, and the text needs none of it.
register(
    'data:text/javascript,export async function load(url, context, next) {' +
        ' return url.endsWith(".css") ? { format: "module", source: "", shortCircuit: true } : next(url, context); }',
);
const { toLLMText } = await import('~/utils/get-llm-text');

const CONTENT_DIR = path.resolve('content/docs');

/** `components/(components)/button/index.mdx` → `components/button`, `(overview)/x.mdx` → `x`, root → `index`. */
function toSlug(file: string): string {
    const segments = file
        .replace(/\.mdx?$/, '')
        .split('/')
        .filter((segment) => !/^\(.+\)$/.test(segment));
    if (segments.at(-1) === 'index') segments.pop();
    return segments.join('/') || 'index';
}

// ponytail: reads single-line `key: value` frontmatter only, which is all the docs use.
// Switch to a YAML parser if a page needs multi-line values.
function readFrontmatter(raw: string, key: string): string | undefined {
    const block = raw.match(/^---\n([\s\S]*?)\n---\n/)?.[1] ?? '';
    const value = block.match(new RegExp(`^${key}:\\s*(.*)$`, 'm'))?.[1].trim();
    return value?.replace(/^(['"])(.*)\1$/, '$2');
}

/** Pages flagged `subpage: true` in frontmatter get folded into their sibling `index.mdx`. */
function isSubpageFile(fullPath: string): boolean {
    return readFrontmatter(fs.readFileSync(fullPath, 'utf8'), 'subpage') === 'true';
}

function siblingIndexOf(file: string): string {
    return `${path.posix.dirname(file)}/index.mdx`;
}

async function renderFile(file: string): Promise<string> {
    const fullPath = path.join(CONTENT_DIR, file);
    const raw = fs.readFileSync(fullPath, 'utf8');
    const slug = toSlug(file);
    return toLLMText({
        raw,
        title: readFrontmatter(raw, 'title') ?? slug,
        description: readFrontmatter(raw, 'description'),
        url: `/docs/${slug === 'index' ? '' : slug}`.replace(/\/$/, ''),
        path: file,
        fullPath,
        contentType: 'docs',
    });
}

async function main() {
    const outDir = process.argv[2];
    if (!outDir) throw new Error('Usage: tsx scripts/build-llm-docs.ts <outDir>');

    const out = path.resolve(outDir);
    fs.rmSync(out, { recursive: true, force: true });

    const allFiles = fs.globSync('**/*.{md,mdx}', { cwd: CONTENT_DIR }).sort();
    const fileSet = new Set(allFiles);

    const subpagesByParent = new Map<string, string[]>();
    const parentFiles: string[] = [];
    for (const file of allFiles) {
        if (isSubpageFile(path.join(CONTENT_DIR, file))) {
            const parent = siblingIndexOf(file);
            const list = subpagesByParent.get(parent) ?? [];
            list.push(file);
            subpagesByParent.set(parent, list);
            if (!fileSet.has(parent)) parentFiles.push(file);
        } else {
            parentFiles.push(file);
        }
    }

    for (const file of parentFiles) {
        const rendered = [await renderFile(file)];
        for (const subpage of subpagesByParent.get(file) ?? []) {
            rendered.push(await renderFile(subpage));
        }

        const target = path.join(out, `${toSlug(file)}.md`);
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.writeFileSync(target, rendered.join('\n\n'));
    }

    console.log(`Wrote ${parentFiles.length} pages to ${out}`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
