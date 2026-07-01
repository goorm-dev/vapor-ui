import css from '@eslint/css';
import { RuleTester } from 'eslint';
import { describe, it } from 'vitest';

import { tokenScopeMismatchRule } from './token-scope-mismatch';

const ruleTester = new RuleTester({ plugins: { css }, language: 'css/css' });

describe('token-scope-mismatch', () => {
    it('runs', () => {
        ruleTester.run('token-scope-mismatch', tokenScopeMismatchRule, {
            valid: [
                // Correct scope: foreground token on color property
                { code: '.x { color: var(--vapor-color-foreground-primary-100); }' },
                // Correct scope: background token on background property
                { code: '.x { background: var(--vapor-color-background-primary-100); }' },
                // Correct scope: dimension token on width property
                { code: '.x { width: var(--vapor-size-dimension-150); }' },
                // Correct scope: space token on padding property
                { code: '.x { padding: var(--vapor-size-space-100); }' },
                // ignoreProperties: skip reporting for listed properties
                {
                    code: '.x { color: var(--vapor-color-background-primary-100); }',
                    options: [{ ignoreProperties: ['color'] }],
                },
                // Unknown CSS property: no expected scopes → skip
                { code: '.x { unknown-prop: var(--vapor-color-background-primary-100); }' },
                // Primitive color token: Rule C handles this, not Rule B
                { code: '.x { color: var(--vapor-color-blue-600); }' },
                // Non-var value: no parts to check
                { code: '.x { color: red; }' },
            ],
            invalid: [
                // background-scope token on color property (expects foreground)
                // --vapor-color-background-primary-100 shares no hex with any fg token → scopeMismatch
                {
                    code: '.x { color: var(--vapor-color-background-primary-100); }',
                    errors: [
                        {
                            messageId: 'scopeMismatch',
                            data: {
                                token: '--vapor-color-background-primary-100',
                                tokenScope: 'background',
                                property: 'color',
                                expectedScopes: 'foreground',
                            },
                        },
                    ],
                },
                // background-scope token on color property with foreground candidates
                // --vapor-color-background-contrast-200 shares hex (gray.800) with
                //   --vapor-color-foreground-secondary-100, --vapor-color-foreground-contrast-100,
                //   --vapor-color-foreground-contrast-200 → scopeMismatchWithSuggestions
                {
                    code: '.x { color: var(--vapor-color-background-contrast-200); }',
                    errors: [
                        {
                            messageId: 'scopeMismatchWithSuggestions',
                            data: {
                                token: '--vapor-color-background-contrast-200',
                                tokenScope: 'background',
                                property: 'color',
                                expectedScopes: 'foreground',
                                candidates:
                                    '--vapor-color-foreground-secondary-100, --vapor-color-foreground-contrast-100, --vapor-color-foreground-contrast-200',
                            },
                        },
                    ],
                },
                // space-scope token on width property (expects dimension)
                // --vapor-size-space-100 (8px) shares px with --vapor-size-dimension-100 → scopeMismatchWithSuggestions
                {
                    code: '.x { width: var(--vapor-size-space-100); }',
                    errors: [
                        {
                            messageId: 'scopeMismatchWithSuggestions',
                            data: {
                                token: '--vapor-size-space-100',
                                tokenScope: 'space',
                                property: 'width',
                                expectedScopes: 'dimension',
                                candidates: '--vapor-size-dimension-100',
                            },
                            suggestions: [
                                {
                                    messageId: 'replaceWithToken',
                                    data: { candidate: '--vapor-size-dimension-100' },
                                    output: '.x { width: var(--vapor-size-dimension-100); }',
                                },
                            ],
                        },
                    ],
                },
                // space-scope token on border-radius property (expects borderRadius)
                // --vapor-size-space-100 (8px) shares px with --vapor-size-borderRadius-300 → scopeMismatchWithSuggestions
                {
                    code: '.x { border-radius: var(--vapor-size-space-100); }',
                    errors: [
                        {
                            messageId: 'scopeMismatchWithSuggestions',
                            data: {
                                token: '--vapor-size-space-100',
                                tokenScope: 'space',
                                property: 'border-radius',
                                expectedScopes: 'borderRadius',
                                candidates: '--vapor-size-borderRadius-300',
                            },
                        },
                    ],
                },
            ],
        });
    });
});
