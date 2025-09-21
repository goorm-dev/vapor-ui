import { fileGenerator, remarkDocGen } from 'fumadocs-docgen';
import { defineConfig, defineDocs } from 'fumadocs-mdx/config';
import { z } from 'zod';

export const docs = defineDocs({
    dir: 'content/docs',
    docs: {
        async: true,
    },
});

const blocksSchema = z.object({
    title: z.string(),
    description: z.string().optional(),
    previewImageUrl: z.string().optional(),
});

export const blocks = defineDocs({
    dir: 'content/blocks',
    docs: {
        async: true,
        schema: blocksSchema,
    },
});

export default defineConfig({
    mdxOptions: {
        remarkNpmOptions: {
            persist: {
                id: 'package-manager',
            },
        },
        remarkPlugins: [[remarkDocGen, { generators: [fileGenerator()] }]],
    },
});
