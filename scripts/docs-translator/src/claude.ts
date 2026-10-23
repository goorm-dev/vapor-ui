import { query } from '@anthropic-ai/claude-agent-sdk';

import type { Guide } from './guide';
import type { Translate } from './page';

const SCHEMA = {
    type: 'object',
    properties: {
        translations: {
            type: 'array',
            items: {
                type: 'object',
                properties: { id: { type: 'string' }, ko: { type: 'string' } },
                required: ['id', 'ko'],
                additionalProperties: false,
            },
        },
    },
    required: ['translations'],
    additionalProperties: false,
};

function systemPrompt(guide: Guide): string {
    return `${guide.body}

## 입력과 출력

입력은 JSON이다. \`items\`의 각 \`text\`가 원문이고, \`terms\`는 이 입력에 적용되는 용어집 항목이다.
모든 item을 위 가이드에 따라 한국어로 번역해, 같은 \`id\`와 번역문 \`ko\`의 쌍으로 하나도 빠짐없이 돌려준다.
원문에 \`terms\`의 \`en\`이 나오면 그 \`ko\`를 쓴다.`;
}

/**
 * A Translate that sends one page's items to Claude through the Agent SDK. The
 * model, guide and JSON schema are fixed; there are no tools and no local
 * settings, so every developer translates under the same conditions.
 * `onCost` receives the reported cost of each call in USD.
 */
export function createClaudeTranslator(guide: Guide, onCost: (usd: number) => void): Translate {
    return async (items, terms) => {
        for await (const message of query({
            prompt: JSON.stringify({ terms, items }, null, 2),
            options: {
                model: guide.model,
                systemPrompt: systemPrompt(guide),
                tools: [],
                settingSources: [],
                persistSession: false,
                outputFormat: { type: 'json_schema', schema: SCHEMA },
            },
        })) {
            if (message.type !== 'result') continue;
            onCost(message.total_cost_usd);

            if (message.subtype === 'success' && message.structured_output) {
                const { translations } = message.structured_output as {
                    translations: { id: string; ko: string }[];
                };
                return Object.fromEntries(translations.map(({ id, ko }) => [id, ko]));
            }
            const errors = 'errors' in message ? message.errors.join('; ') : 'no structured output';
            throw new Error(`Claude returned ${message.subtype}: ${errors}`);
        }
        throw new Error('Claude returned no result');
    };
}

/** Who pays, in the Agent SDK's order: an API key wins over the subscription token. */
export function billingSource(env: NodeJS.ProcessEnv): string {
    if (env.ANTHROPIC_API_KEY) return 'ANTHROPIC_API_KEY (billed to that API account)';
    if (env.CLAUDE_CODE_OAUTH_TOKEN) return 'CLAUDE_CODE_OAUTH_TOKEN (your Claude subscription)';
    return 'Claude Code login on this machine (your Claude subscription, if logged in)';
}
