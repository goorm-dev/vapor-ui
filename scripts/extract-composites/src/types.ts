import { z } from 'zod';

export interface FigmaNode {
    id: string;
    name: string;
    type: string;
    characters?: string;
    children?: FigmaNode[];
    componentId?: string;
    componentProperties?: Record<string, { value: string | boolean; type: string }>;
    absoluteBoundingBox?: { x: number; y: number; width: number; height: number };
    style?: { fontWeight?: number; fontSize?: number };
}

export const itemSchema = z
    .object({
        // Common content fields
        subtitle: z.string().optional(),
        description: z.string().optional(),
        image: z.string().optional(),
        // Examples
        code: z.string().nullable().optional(),
        codeLabel: z.string().optional(),
        // Do + Don't
        do: z
            .object({
                image: z.string(),
                caption: z.string().optional(),
            })
            .optional(),
        dont: z
            .object({
                image: z.string(),
                caption: z.string().optional(),
            })
            .optional(),
        // Anatomy table row
        name: z.string().optional(),
        optional: z.boolean().optional(),
    })
    .passthrough();

export const sectionSchema = z.object({
    title: z.string(),
    description: z.string().optional(),
    image: z.string().optional(), // Anatomy carries the diagram at section level
    items: z.array(itemSchema),
});

export const indexSchema = z.object({
    slug: z.string(),
    name: z.string(),
    description: z.string().optional(),
    source: z.object({
        fileKey: z.string(),
        nodeId: z.string(),
        extractedAt: z.string(),
    }),
    sections: z.record(sectionSchema),
});

export type Item = z.infer<typeof itemSchema>;
export type Section = z.infer<typeof sectionSchema>;
export type IndexJson = z.infer<typeof indexSchema>;
