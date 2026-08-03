import { callLlm } from '~/client';
import { errorMessage } from '~/util';

export type BatchResult<T> = { ok: true; value: T } | { ok: false; reason: string };

function parseLlmJson(content: string): unknown {
    const trimmed = content.trim();
    const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
    let jsonContent = fenced ? fenced[1].trim() : trimmed;

    if (!jsonContent.startsWith('{') && !jsonContent.startsWith('[')) {
        const match = jsonContent.match(/[{[][\s\S]*[}\]]/);
        if (match) jsonContent = match[0];
    }

    return JSON.parse(jsonContent);
}

function reconcileById<T extends { id: string }>(
    expectedIds: string[],
    items: T[],
): Map<string, T> {
    const expected = new Set(expectedIds);
    const result = new Map<string, T>();

    for (const item of items) {
        if (!expected.has(item.id)) throw new Error(`Unknown response id: ${item.id}`);
        if (result.has(item.id)) throw new Error(`Duplicate response id: ${item.id}`);
        result.set(item.id, item);
    }
    for (const id of expected) {
        if (!result.has(id)) throw new Error(`Missing response id: ${id}`);
    }
    return result;
}

export async function callBatch<Item extends { id: string }>(
    label: string,
    systemPrompt: string,
    model: string,
    schema: { name: string; schema: object },
    request: object,
    expectedIds: string[],
    field: string,
): Promise<BatchResult<Map<string, Item>>> {
    const result = await callLlm(
        [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: JSON.stringify(request) },
        ],
        { model, jsonSchema: schema },
    );

    if (!result.content) {
        const statusInfo = result.statusCode !== undefined ? ` (HTTP ${result.statusCode})` : '';
        return { ok: false, reason: `[${label}] ${result.error ?? 'empty response'}${statusInfo}` };
    }

    try {
        const parsed = parseLlmJson(result.content);
        if (typeof parsed !== 'object' || parsed === null) {
            return { ok: false, reason: `${label} response must be a JSON object` };
        }
        const items = (parsed as Record<string, unknown>)[field];
        if (!Array.isArray(items)) {
            return { ok: false, reason: `${label} response must contain ${field}[]` };
        }
        return { ok: true, value: reconcileById(expectedIds, items as Item[]) };
    } catch (error) {
        return { ok: false, reason: errorMessage(error) };
    }
}
