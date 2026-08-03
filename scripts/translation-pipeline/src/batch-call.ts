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

/**
 * LLM이 echo한 id 목록을 기대 id 집합과 대조한다. 하나라도 어긋나면 던진다 —
 * 조용한 오매핑보다 배치 실패가 낫다.
 */
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

/**
 * LLM 배치 호출 한 번의 공통 껍데기: 호출 → content 확인 → JSON 파싱 → id 대조.
 * 어느 단계에서 깨져도 던지지 않고 `{ok:false, reason}`으로 내려 배치 단위 격하로 이어진다.
 */
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
