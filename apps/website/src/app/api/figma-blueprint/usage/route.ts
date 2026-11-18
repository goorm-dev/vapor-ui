import { neon } from '@neondatabase/serverless';
import { z } from 'zod';

const run = {
    fileKey: z.string().regex(/^[A-Za-z0-9]{22,128}$/),
    nodeId: z
        .string()
        .max(64)
        .regex(/^(\d+:\d+)?$/),
    version: z
        .string()
        .max(64)
        .regex(/^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/),
};

const body = z.discriminatedUnion('outcome', [
    z.strictObject({ ...run, outcome: z.enum(['ok', 'unscorable']) }),
    z.strictObject({
        ...run,
        outcome: z.literal('error'),
        stage: z.enum(['fetch', 'catalog', 'blueprint']),
        status: z.number().int().min(100).max(599).optional(),
    }),
]);

export async function POST(request: Request) {
    let json: unknown;
    try {
        json = await request.json();
    } catch {
        return new Response('Body must be valid JSON', { status: 400 });
    }

    const parsed = body.safeParse(json);
    if (!parsed.success) return new Response(z.prettifyError(parsed.error), { status: 400 });

    const { fileKey, nodeId, version, outcome } = parsed.data;
    const stage = parsed.data.outcome === 'error' ? parsed.data.stage : null;
    const status = parsed.data.outcome === 'error' ? (parsed.data.status ?? null) : null;

    const sql = neon(process.env.DATABASE_URL!);
    await sql`
        insert into figma_blueprint_usage (file_key, node_id, version, outcome, stage, status)
        values (${fileKey}, ${nodeId}, ${version}, ${outcome}, ${stage}, ${status})
    `;

    return new Response(null, { status: 204 });
}
