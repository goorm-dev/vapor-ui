import { z } from 'zod';

export const GlobalConfigSchema = z.object({
    tsconfig: z.string().optional(),
    exclude: z.array(z.string()).default([]),
    excludeDefaults: z.boolean().default(true),
    outputDir: z.string().default('./output'),
    languages: z.array(z.string()).default(['ko']),
    defaultLanguage: z.string().default('ko'),
    filterExternal: z.boolean().default(true),
    filterHtml: z.boolean().default(true),
    filterSprinkles: z.boolean().default(true),
    includeHtml: z.array(z.string()).optional(),
});

export const ComponentConfigSchema = z.object({
    exclude: z.array(z.string()).optional(),
    include: z.array(z.string()).optional(),
});

export const ExtractorConfigSchema = z.object({
    global: GlobalConfigSchema.default({}),
    components: z.record(z.string(), ComponentConfigSchema).default({}),
});

export type ExtractorConfig = z.infer<typeof ExtractorConfigSchema>;
export type ExtractorConfigInput = z.input<typeof ExtractorConfigSchema>;
export type GlobalConfig = z.infer<typeof GlobalConfigSchema>;
export type ComponentConfig = z.infer<typeof ComponentConfigSchema>;
