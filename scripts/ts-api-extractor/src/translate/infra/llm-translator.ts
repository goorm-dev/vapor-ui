import type { query as QueryFn } from '@anthropic-ai/claude-agent-sdk';

import type { Terms } from '~/translate/core/rules';
import type { Translator } from '~/translate/core/translator';

const MODEL = 'claude-opus-5';

/** 구조화 출력은 스키마를 지정해도 타입이 좁혀지지 않아 여기서 형태를 못 박는다. */
interface TranslationResponse {
    translations?: { id?: string; ko?: string }[];
}

const RESPONSE_SCHEMA = {
    type: 'object',
    additionalProperties: false,
    required: ['translations'],
    properties: {
        translations: {
            type: 'array',
            items: {
                type: 'object',
                additionalProperties: false,
                required: ['id', 'ko'],
                properties: { id: { type: 'string' }, ko: { type: 'string' } },
            },
        },
    },
};

/** 용어 사전을 프롬프트 문단으로 편다. */
export function buildGlossary(terms: Terms): string {
    return [
        '용어 사전(반드시 이 표기를 쓴다):',
        ...terms.terms.map((entry) => {
            const avoid = entry.avoid?.length ? `   (X: ${entry.avoid.join(', ')})` : '';
            return `- ${entry.term} → ${entry.use}${avoid}`;
        }),
        '',
        '문형:',
        ...terms.sentencePatterns.map((pattern) => `- ${pattern.en} → ${pattern.ko}`),
    ].join('\n');
}

export function chunk<T>(items: readonly T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size));
    return chunks;
}

export interface LlmTranslatorOptions {
    terms: Terms;
    batchSize: number;
    onProgress?: (done: number, total: number) => void;
    onCost?: (usd: number) => void;
}

/**
 * Agent SDK로 번역한다. SDK는 로컬 전용이라 동적으로 불러온다 — 이 패키지를
 * 워크스페이스에 정식 의존으로 매달면 무관한 패키지의 peer 해석이 흔들린다.
 */
export async function createLlmTranslator({
    terms,
    batchSize,
    onProgress,
    onCost,
}: LlmTranslatorOptions): Promise<Translator> {
    let query: typeof QueryFn;
    try {
        ({ query } = await import('@anthropic-ai/claude-agent-sdk'));
    } catch {
        throw new Error(
            '번역에는 @anthropic-ai/claude-agent-sdk가 필요합니다. 먼저 설치하세요:\n' +
                '  pnpm --filter @vapor-ui/ts-api-extractor add -D @anthropic-ai/claude-agent-sdk',
        );
    }

    const glossary = buildGlossary(terms);

    return async (sources) => {
        const translations = new Map<string, string>();
        const batches = chunk(sources, batchSize);

        for (const batch of batches) {
            // id → 원문을 사전으로 들고 간다. 응답 순서에 기대면 배치 하나가
            // 어긋날 때 엉뚱한 번역이 조용히 사전에 박힌다.
            const byId = new Map(batch.map((source, i) => [`u${i}`, source]));
            const units = [...byId].map(([id, text]) => ({ id, text }));

            const response = query({
                prompt: `규칙:
- 백틱 코드 스팬, prop 이름, 타입 이름은 원문 그대로 둔다.
- 원문에 없는 사실을 추가하지 않는다. 설명을 보충하거나 조건을 덧붙이지 않는다.
- 문장체 존댓말(-입니다/-합니다)로 쓴다.

${glossary}

${JSON.stringify(units)}`,
                options: {
                    model: MODEL,
                    systemPrompt: '너는 vapor-ui 디자인 시스템의 API 문서 번역가다. 번역만 한다.',
                    // 도구를 켜면 모델이 소스를 읽고 원문에 없는 설명을 덧붙인다(실측).
                    allowedTools: [],
                    maxTurns: 1,
                    outputFormat: { type: 'json_schema', schema: RESPONSE_SCHEMA },
                },
            });

            let received = 0;
            for await (const message of response) {
                if (message.type !== 'result') continue;
                if (message.subtype !== 'success') throw new Error(`번역 실패: ${message.subtype}`);

                const output = message.structured_output as TranslationResponse | undefined;
                for (const item of output?.translations ?? []) {
                    const source = item.id === undefined ? undefined : byId.get(item.id);
                    if (source === undefined || !item.ko?.trim()) continue;
                    translations.set(source, item.ko);
                    received++;
                }
                onCost?.(message.total_cost_usd ?? 0);
            }

            if (received !== batch.length) {
                throw new Error(
                    `반환 개수가 요청과 다릅니다(${received}/${batch.length}). 사전을 저장하지 않고 중단합니다.`,
                );
            }
            onProgress?.(translations.size, sources.length);
        }

        return translations;
    };
}
