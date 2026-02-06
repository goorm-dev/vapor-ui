import { z } from 'zod';

export const GlobalConfigSchema = z.object({
    outputDir: z.string().default('./output'),
    languages: z.array(z.string()).default(['ko']),
    defaultLanguage: z.string().default('ko'),
    filterExternal: z.boolean().default(true),
    filterSprinkles: z.boolean().default(true),
    filterHtml: z.boolean().default(true),
    includeHtml: z.array(z.string()).optional(),
});

export const SprinklesConfigSchema = z.object({
    metaPath: z.string().default('./generated/sprinkles-meta.json'),
    include: z.array(z.string()).optional(),
});

export const ComponentConfigSchema = z.object({
    sprinkles: z.array(z.string()).optional(),
    sprinklesAll: z.boolean().optional(),
    exclude: z.array(z.string()).optional(),
    include: z.array(z.string()).optional(),
});

export const ExtractorConfigSchema = z.object({
    global: GlobalConfigSchema.default({}),
    sprinkles: SprinklesConfigSchema.default({}),
    components: z.record(z.string(), ComponentConfigSchema).default({}),
});

export type ExtractorConfig = z.infer<typeof ExtractorConfigSchema>;
export type GlobalConfig = z.infer<typeof GlobalConfigSchema>;
export type SprinklesConfig = z.infer<typeof SprinklesConfigSchema>;
export type ComponentConfig = z.infer<typeof ComponentConfigSchema>;
