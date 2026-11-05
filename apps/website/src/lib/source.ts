import type { InferPageType } from 'fumadocs-core/source';
import { loader } from 'fumadocs-core/source';
import { docs, theme } from 'fumadocs-mdx/collections/server';

export const source = loader({
    baseUrl: '/docs',
    source: docs.toFumadocsSource(),
    pageTree: {
        transformers: [
            {
                /**
                 * Mark page tree items whose source file sets `subpage: true` in frontmatter,
                 * so the sidebar can hide them while keeping them resolvable for `useTreePath`.
                 */
                file(node, filePath) {
                    if (!filePath) return node;
                    const file = this.storage.read(filePath);
                    if (file?.format !== 'page') return node;
                    if ((file.data as { subpage?: unknown }).subpage === true) {
                        (node as { subpage?: boolean }).subpage = true;
                    }
                    return node;
                },
                folder(node) {
                    node.children = node.children.map((child) =>
                        child.type === 'folder' && child.index && child.children.length === 0
                            ? child.index
                            : child,
                    );
                    return node;
                },
            },
        ],
    },
});

export const themeSource = loader({
    baseUrl: '/theme',
    source: theme.toFumadocsSource(),
});

export type Page = InferPageType<typeof source>;
