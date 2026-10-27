import type { InferPageType } from 'fumadocs-core/source';
import { loader } from 'fumadocs-core/source';
import { docs, theme } from 'fumadocs-mdx/collections/server';

export const source = loader({
    baseUrl: '/docs',
    source: docs.toFumadocsSource(),
    pageTree: {
        transformers: [
            {
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
