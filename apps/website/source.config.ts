import { rehypeCodeDefaultOptions } from 'fumadocs-core/mdx-plugins';
import { defineConfig, defineDocs, frontmatterSchema } from 'fumadocs-mdx/config';
import lastModified from 'fumadocs-mdx/plugins/last-modified';
import { z } from 'zod';

import { remarkDemoSource } from './src/lib/remark-demo-source';

const docsFrontmatterSchema = frontmatterSchema.extend({
    /**
     * `true` on a sibling `.mdx` served as an in-page tab (e.g. Properties).
     * The LLM/source layers fold these back into the parent URL and hide them
     * from sidebars so the parent is the one canonical entry.
     */
    subpage: z.boolean().optional(),
    site_name: z.string().optional(),
});

export const docs = defineDocs({
    dir: 'content/docs',
    docs: {
        async: true,
        schema: docsFrontmatterSchema,
    },
    // Only meta.json configures the sidebar; api/{en,ko}/*.json next to a page is props data.
    meta: {
        files: ['**/meta.json'],
    },
});

const themeSchema = z.object({
    title: z.string(),
    description: z.string().optional(),
});

export const theme = defineDocs({
    dir: 'content/theme',
    docs: {
        async: true,
        schema: themeSchema,
    },
});

export default defineConfig({
    plugins: [lastModified()],
    mdxOptions: {
        remarkNpmOptions: {
            persist: {
                id: 'package-manager',
            },
        },
        remarkPlugins: [remarkDemoSource],
        rehypeCodeOptions: {
            ...rehypeCodeDefaultOptions,
            lazy: true,
            engine: 'js',
            langs: ['ts', 'js', 'html', 'tsx', 'mdx'],
            inline: 'tailing-curly-colon',
            themes: {
                light: 'github-light',
                dark: 'github-dark',
            },
        },
    },
});
