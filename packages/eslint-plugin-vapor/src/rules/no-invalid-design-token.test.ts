import css from '@eslint/css';
import { RuleTester } from 'eslint';
import { describe, it } from 'vitest';

import { noInvalidDesignTokenRule } from './no-invalid-design-token';

const ruleTester = new RuleTester({
    plugins: { css },
    language: 'css/css',
});

describe('no-invalid-design-token', () => {
    it('runs', () => {
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
            ],
            invalid: [
                {
                    code: '.x { color: var(--vapor-color-foregruond-primary-100); }',
                    errors: [
                        {
                            messageId: 'unknownTokenWithSuggestions',
                            data: {
                                token: '--vapor-color-foregruond-primary-100',
                                candidates: '--vapor-color-foreground-primary-100',
                            },
                        },
                    ],
                },
                {
                    code: '.x { color: var(--vapor-totally-unknown-xx-yy); }',
                    errors: [{ messageId: 'unknownToken' }],
                },
                {
                    code: '.x { color: var(--vapor-color-foregruond-primary-100); }',
                    errors: [
                        {
                            messageId: 'unknownTokenWithSuggestions',
                            suggestions: [
                                {
                                    messageId: 'replaceWithToken',
                                    data: { candidate: '--vapor-color-foreground-primary-100' },
                                    output: '.x { color: var(--vapor-color-foreground-primary-100); }',
                                },
                            ],
                        },
                    ],
                },
                {
                    code: '.x { color: var(--vapor-color-foreground-primary-100); width: var(--vapor-typo-broken-name); }',
                    errors: [{ messageId: 'unknownToken' }],
                },
                {
                    code: '.x { color: var(--vapor-app-x); }',
                    errors: [{ messageId: 'unknownToken' }],
                },
            ],
        });
    });
});
