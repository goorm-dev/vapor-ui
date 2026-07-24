import type { Rule } from 'eslint';

import type { Scope } from '~/data/property-scope-map';
import { PROPERTY_SCOPE } from '~/data/property-scope-map';
import { parseDeclarationValue } from '~/utils/css-value-parser';
import { TOKEN_INDEX } from '~/utils/token-index';

interface Options {
    propertyScopeMap?: Record<string, Scope[]>;
    ignoreProperties?: readonly string[];
}

export const tokenScopeMismatchRule: Rule.RuleModule = {
    meta: {
        type: 'problem',
        hasSuggestions: true,
        docs: {
            description:
                'Disallow Vapor design tokens whose scope does not match the CSS property scope.',
        },
        schema: [
            {
                type: 'object',
                properties: {
                    propertyScopeMap: { type: 'object' },
                    ignoreProperties: { type: 'array', items: { type: 'string' } },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            scopeMismatch:
                '"{{ token }}"의 scope는 "{{ tokenScope }}"이지만, "{{ property }}"는 {{ expectedScopes }}을(를) 요구합니다.',
            scopeMismatchWithSuggestions:
                '"{{ token }}"의 scope는 "{{ tokenScope }}"이지만, "{{ property }}"는 {{ expectedScopes }}을(를) 요구합니다.',
            replaceWithToken: '"{{ candidate }}"(으)로 교체',
        },
    },

    create(context) {
        const opts = (context.options[0] ?? {}) as Options;
        const ignoreProps = new Set(opts.ignoreProperties ?? []);
        const mergedMap: Record<string, readonly Scope[]> = {
            ...PROPERTY_SCOPE,
            ...(opts.propertyScopeMap ?? {}),
        };

        return {
            Declaration(node: unknown) {
                const decl = node as { property?: string; value?: unknown };
                const property = decl.property;
                if (!property) return;
                if (ignoreProps.has(property)) return;
                const expectedScopes = mergedMap[property];
                if (!expectedScopes) return;

                const parts = parseDeclarationValue(decl.value);
                for (const part of parts) {
                    if (part.type !== 'var') continue;
                    const meta = TOKEN_INDEX.tokenMeta.get(part.name);
                    if (!meta) continue; // unknown token — Rule A's job
                    if (meta.scope === 'primitive') continue; // primitive — Rule C's job

                    const tokenScope = meta.scope as Scope;
                    if (expectedScopes.includes(tokenScope)) continue;

                    // Gather candidates: same-value tokens in expected scopes
                    let candidates: string[] = [];
                    if (meta.hex !== undefined) {
                        // Color token: look for semantic tokens with same hex in expected scopes
                        const matches = TOKEN_INDEX.byHex.get(meta.hex) ?? [];
                        matches.forEach((n) => {
                            const m = TOKEN_INDEX.tokenMeta.get(n);
                            if (
                                m?.kind === 'semantic' &&
                                expectedScopes.includes(m.scope as Scope)
                            ) {
                                candidates.push(n);
                            }
                        });
                        candidates = candidates.slice(0, 3);
                    } else if (meta.px !== undefined) {
                        // Foundation dimensional token: look for foundation tokens with same px in expected scopes
                        const matches = TOKEN_INDEX.byPx.get(meta.px) ?? [];
                        matches.forEach((n) => {
                            const m = TOKEN_INDEX.tokenMeta.get(n);
                            if (
                                m?.kind === 'foundation' &&
                                expectedScopes.includes(m.scope as Scope)
                            ) {
                                candidates.push(n);
                            }
                        });
                        candidates = candidates.slice(0, 3);
                    }

                    const reportNode = (decl as { value: unknown }).value;
                    const data = {
                        token: part.name,
                        tokenScope: String(tokenScope),
                        property,
                        expectedScopes: [...expectedScopes].join(', '),
                    };

                    if (candidates.length > 0) {
                        // Capture part offset for use in suggest closures
                        const capturedOffset = part.offset;
                        const capturedName = part.name;
                        context.report({
                            node: reportNode as never,
                            messageId: 'scopeMismatchWithSuggestions',
                            data: { ...data, candidates: candidates.join(', ') },
                            suggest: candidates.map((c) => ({
                                messageId: 'replaceWithToken' as const,
                                data: { candidate: c },
                                fix(fixer: Rule.RuleFixer) {
                                    // part.offset is an absolute document offset (from @eslint/css AST).
                                    // @eslint/css nodes have no .range property, so we use the offset directly.
                                    const tokenStart = capturedOffset;
                                    const tokenEnd = tokenStart + capturedName.length;
                                    return fixer.replaceTextRange([tokenStart, tokenEnd], c);
                                },
                            })),
                        });
                    } else {
                        context.report({
                            node: reportNode as never,
                            messageId: 'scopeMismatch',
                            data,
                        });
                    }
                }
            },
        };
    },
};
