import type { Rule } from 'eslint';

import type { Scope } from '~/data/property-scope-map';
import { PROPERTY_SCOPE } from '~/data/property-scope-map';
import { parseDeclarationValue } from '~/utils/css-value-parser';
import { TOKEN_INDEX } from '~/utils/token-index';

interface Options {
    categories?: readonly Scope[];
    ignoreProperties?: readonly string[];
    ignoreValues?: readonly string[];
    maxSuggestions?: number;
}

const DEFAULT_IGNORE_VALUES = [
    '0',
    '0px',
    'transparent',
    'none',
    'currentcolor',
    'inherit',
    'initial',
    'unset',
];

function isColorScope(scopes: readonly Scope[]): boolean {
    return scopes.every((s) => s === 'foreground' || s === 'background' || s === 'border');
}

function isFoundationScope(scopes: readonly Scope[]): boolean {
    return scopes.every((s) => s === 'dimension' || s === 'space' || s === 'borderRadius');
}

export const preferDesignTokenRule: Rule.RuleModule = {
    meta: {
        type: 'suggestion',
        hasSuggestions: true,
        docs: {
            description: '원시 토큰이나 CSS 값을 사용하는 대신 Vapor 디자인 토큰을 사용하세요.',
        },
        schema: [
            {
                type: 'object',
                properties: {
                    categories: { type: 'array', items: { type: 'string' } },
                    ignoreProperties: { type: 'array', items: { type: 'string' } },
                    ignoreValues: { type: 'array', items: { type: 'string' } },
                    maxSuggestions: { type: 'number' },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            preferSemantic:
                '"{{ property }}"에서 primitive 토큰 "{{ token }}" 대신 시맨틱 토큰 "{{ candidate }}"을(를) 사용하세요.',
            preferToken:
                '"{{ property }}"에서 "{{ rawValue }}" 대신 디자인 토큰 "{{ candidate }}"을(를) 사용하세요.',
            replaceWithToken: '"{{ candidate }}"(으)로 교체',
        },
    },

    create(context) {
        const opts = (context.options[0] ?? {}) as Options;
        const maxSuggestions = opts.maxSuggestions ?? 3;
        const ignoreProps = new Set(opts.ignoreProperties ?? []);
        const ignoreValues = new Set(opts.ignoreValues ?? DEFAULT_IGNORE_VALUES);
        const categories = opts.categories ? new Set(opts.categories) : null;

        function scopeAllowed(scopes: readonly Scope[]): boolean {
            if (!categories) return true;
            return scopes.some((s) => categories.has(s));
        }

        return {
            Declaration(node: unknown) {
                const decl = node as { property?: string; value?: unknown };
                const property = decl.property;
                if (!property || ignoreProps.has(property)) return;
                const expectedScopes = PROPERTY_SCOPE[property];
                if (!expectedScopes || !scopeAllowed(expectedScopes)) return;

                const parts = parseDeclarationValue(decl.value);

                parts.forEach((part) => {
                    if (part.type === 'var') {
                        const meta = TOKEN_INDEX.tokenMeta.get(part.name);
                        if (!meta || meta.kind !== 'primitive' || !meta.hex) return;
                        const candidates = (TOKEN_INDEX.byHex.get(meta.hex) ?? [])
                            .filter((n) => {
                                const m = TOKEN_INDEX.tokenMeta.get(n);
                                return (
                                    m?.kind === 'semantic' &&
                                    expectedScopes.includes(m.scope as Scope)
                                );
                            })
                            .slice(0, maxSuggestions);
                        if (candidates.length === 0) return;
                        const capturedOffset = part.offset;
                        const capturedName = part.name;
                        context.report({
                            node: decl.value as never,
                            messageId: 'preferSemantic',
                            data: { candidate: candidates[0], token: part.name, property },
                            suggest: candidates.map((c) => ({
                                messageId: 'replaceWithToken' as const,
                                data: { candidate: c },
                                fix(fixer: Rule.RuleFixer) {
                                    // part.offset is an absolute document offset (from @eslint/css AST).
                                    const tokenStart = capturedOffset;
                                    const tokenEnd = tokenStart + capturedName.length;
                                    return fixer.replaceTextRange([tokenStart, tokenEnd], c);
                                },
                            })),
                        });
                    } else if (part.type === 'hex') {
                        if (
                            ignoreValues.has(part.raw.toLowerCase()) ||
                            ignoreValues.has(part.normalized)
                        )
                            return;
                        if (!isColorScope(expectedScopes)) return;
                        const semantic = (TOKEN_INDEX.byHex.get(part.normalized) ?? []).filter(
                            (n) => {
                                const m = TOKEN_INDEX.tokenMeta.get(n);
                                return (
                                    m?.kind === 'semantic' &&
                                    expectedScopes.includes(m.scope as Scope)
                                );
                            },
                        );
                        const primitives =
                            semantic.length === 0
                                ? (TOKEN_INDEX.byHex.get(part.normalized) ?? []).filter(
                                      (n) => TOKEN_INDEX.tokenMeta.get(n)?.kind === 'primitive',
                                  )
                                : [];
                        const candidates = (semantic.length ? semantic : primitives).slice(
                            0,
                            maxSuggestions,
                        );
                        if (candidates.length === 0) return;
                        const capturedOffset = part.offset;
                        const capturedRaw = part.raw;
                        const candidate0 = candidates[0];
                        context.report({
                            node: decl.value as never,
                            messageId: 'preferToken',
                            data: { candidate: candidate0, rawValue: part.raw, property },
                            suggest: candidates.map((c) => ({
                                messageId: 'replaceWithToken' as const,
                                data: { candidate: c },
                                fix(fixer: Rule.RuleFixer) {
                                    const tokenStart = capturedOffset;
                                    const tokenEnd = tokenStart + capturedRaw.length;
                                    return fixer.replaceTextRange(
                                        [tokenStart, tokenEnd],
                                        `var(${c})`,
                                    );
                                },
                            })),
                        });
                    } else if (part.type === 'dimension') {
                        if (part.unit !== 'px') return;
                        if (ignoreValues.has(part.raw.toLowerCase())) return;
                        if (!isFoundationScope(expectedScopes)) return;
                        const candidates = (TOKEN_INDEX.byPx.get(part.value) ?? [])
                            .filter((n) => {
                                const m = TOKEN_INDEX.tokenMeta.get(n);
                                return (
                                    m?.kind === 'foundation' &&
                                    expectedScopes.includes(m.scope as Scope)
                                );
                            })
                            .slice(0, maxSuggestions);
                        if (candidates.length === 0) return;
                        const capturedOffset = part.offset;
                        const capturedRaw = part.raw;
                        const candidate0 = candidates[0];
                        context.report({
                            node: decl.value as never,
                            messageId: 'preferToken',
                            data: { candidate: candidate0, rawValue: part.raw, property },
                            suggest: candidates.map((c) => ({
                                messageId: 'replaceWithToken' as const,
                                data: { candidate: c },
                                fix(fixer: Rule.RuleFixer) {
                                    const tokenStart = capturedOffset;
                                    const tokenEnd = tokenStart + capturedRaw.length;
                                    return fixer.replaceTextRange(
                                        [tokenStart, tokenEnd],
                                        `var(${c})`,
                                    );
                                },
                            })),
                        });
                    }
                });
            },
        };
    },
};
