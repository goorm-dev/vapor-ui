import css from '@eslint/css';
import { RuleTester } from 'eslint';

import { noInvalidDesignTokenRule } from './no-invalid-design-token';

// NOTE: ruleTester.run must be called at the top level, NOT inside it().
// With vitest `globals: true`, RuleTester registers each case via the global
// describe/it — nesting that inside a running it() silently skips every case.
const ruleTester = new RuleTester({
    plugins: { css },
    language: 'css/css',
});

ruleTester.run('no-invalid-design-token', noInvalidDesignTokenRule, {
    valid: [
        { code: '.x { color: var(--vapor-color-foreground-primary-100); }' },
        { code: '.x { width: var(--vapor-size-dimension-150); }' },
        {
            code: '.x { color: var(--vapor-app-color); }',
            options: [{ allowCustomTokens: ['--vapor-app-*'] }],
        },
        { code: '.x { color: var(--my-token); }' },
        { code: '.x { color: red; }' },
        {
            code: '.x { color: var(--vapor-app-color); }',
            settings: { vapor: { customTokens: ['--vapor-app-*'] } },
        },
        // Valid token inside a var() fallback
        { code: '.x { color: var(--my-token, var(--vapor-color-foreground-primary-100)); }' },
    ],
    invalid: [
        {
            code: '.x { color: var(--vapor-color-foregruond-primary-100); }',
            errors: [
                {
                    messageId: 'unknownTokenWithSuggestions',
                    data: {
                        token: '--vapor-color-foregruond-primary-100',
                        // distance 1 (transposition) first, then distance 2 (+100→200)
                        candidates:
                            '--vapor-color-foreground-primary-100, --vapor-color-foreground-primary-200',
                    },
                    suggestions: [
                        {
                            messageId: 'replaceWithToken',
                            data: { candidate: '--vapor-color-foreground-primary-100' },
                            output: '.x { color: var(--vapor-color-foreground-primary-100); }',
                        },
                        {
                            messageId: 'replaceWithToken',
                            data: { candidate: '--vapor-color-foreground-primary-200' },
                            output: '.x { color: var(--vapor-color-foreground-primary-200); }',
                        },
                    ],
                },
            ],
        },
        {
            code: '.x { color: var(--vapor-totally-unknown-xx-yy); }',
            errors: [{ messageId: 'unknownToken' }],
        },
        {
            code: '.x { color: var(--vapor-color-foreground-primary-100); width: var(--vapor-typo-broken-name); }',
            errors: [{ messageId: 'unknownToken' }],
        },
        {
            code: '.x { color: var(--vapor-app-x); }',
            errors: [{ messageId: 'unknownToken' }],
        },
        // Typo token nested in a var() fallback — parsed from the Raw text,
        // and the suggestion fix must target the fallback's exact offset
        {
            code: '.x { color: var(--my-token, var(--vapor-color-foregruond-primary-100)); }',
            errors: [
                {
                    messageId: 'unknownTokenWithSuggestions',
                    data: {
                        token: '--vapor-color-foregruond-primary-100',
                        candidates:
                            '--vapor-color-foreground-primary-100, --vapor-color-foreground-primary-200',
                    },
                    suggestions: [
                        {
                            messageId: 'replaceWithToken',
                            data: { candidate: '--vapor-color-foreground-primary-100' },
                            output: '.x { color: var(--my-token, var(--vapor-color-foreground-primary-100)); }',
                        },
                        {
                            messageId: 'replaceWithToken',
                            data: { candidate: '--vapor-color-foreground-primary-200' },
                            output: '.x { color: var(--my-token, var(--vapor-color-foreground-primary-200)); }',
                        },
                    ],
                },
            ],
        },
    ],
});
