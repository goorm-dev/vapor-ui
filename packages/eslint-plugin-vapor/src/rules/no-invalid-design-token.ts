import type { Rule } from 'eslint';

import { matchAllowlist } from '~/utils/allowlist-matcher';
import { parseDeclarationValue } from '~/utils/css-value-parser';
import { segmentDistance } from '~/utils/segment-distance';
import { TOKEN_INDEX } from '~/utils/token-index';

interface Options {
    allowCustomTokens?: readonly string[];
}

function findCandidates(name: string): string[] {
    const scored: Array<{ name: string; dist: number }> = [];
    TOKEN_INDEX.canonicalTokens.forEach((canonical) => {
        const d = segmentDistance(name, canonical);
        if (d !== null) scored.push({ name: canonical, dist: d });
    });
    scored.sort((a, b) => a.dist - b.dist);
    return scored.slice(0, 3).map((c) => c.name);
}

export const noInvalidDesignTokenRule: Rule.RuleModule = {
    meta: {
        type: 'problem',
        hasSuggestions: true,
        docs: {
            description:
                'Disallow CSS var() references to Vapor design tokens that are not in the catalog.',
        },
        schema: [
            {
                type: 'object',
                properties: {
                    allowCustomTokens: { type: 'array', items: { type: 'string' } },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            unknownToken: '"{{ token }}"은(는) Vapor 디자인 토큰이 아닙니다.',
            unknownTokenWithSuggestions: '"{{ token }}"은(는) Vapor 디자인 토큰이 아닙니다. ',
            replaceWithToken: '"{{ candidate }}"(으)로 교체',
        },
    },

    create(context) {
        const opts = (context.options[0] ?? {}) as Options;
        const settingsAllow =
            (context.settings as { vapor?: { customTokens?: readonly string[] } }).vapor
                ?.customTokens ?? [];
        const allow: readonly string[] = [...(opts.allowCustomTokens ?? []), ...settingsAllow];

        return {
            Declaration(node: unknown) {
                const decl = node as { value?: unknown; loc?: unknown };
                const parts = parseDeclarationValue(decl.value);
                for (const part of parts) {
                    if (part.type !== 'var') continue;
                    if (!part.name.startsWith('--vapor-')) continue;
                    if (TOKEN_INDEX.canonicalTokens.has(part.name)) continue;
                    if (allow.length && matchAllowlist(part.name, allow)) continue;

                    const candidates = findCandidates(part.name);
                    const reportNode = (decl as { value: { loc: unknown } }).value;

                    if (candidates.length > 0) {
                        context.report({
                            node: reportNode as never,
                            messageId: 'unknownTokenWithSuggestions',
                            data: { token: part.name, candidates: candidates.join(', ') },
                            suggest: candidates.map((c) => ({
                                messageId: 'replaceWithToken',
                                data: { candidate: c },
                                fix(fixer) {
                                    // part.offset is an absolute document offset (from @eslint/css AST loc.start.offset).
                                    // @eslint/css nodes have no .range property, so we use the offset directly.
                                    const tokenStart = part.offset;
                                    const tokenEnd = tokenStart + part.name.length;
                                    return fixer.replaceTextRange([tokenStart, tokenEnd], c);
                                },
                            })),
                        });
                    } else {
                        context.report({
                            node: reportNode as never,
                            messageId: 'unknownToken',
                            data: { token: part.name },
                        });
                    }
                }
            },
        };
    },
};
