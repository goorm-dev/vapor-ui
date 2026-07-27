import css from '@eslint/css';
import { RuleTester } from 'eslint';

import { tokenScopeMismatchRule } from './token-scope-mismatch';

// NOTE: ruleTester.run must be called at the top level, NOT inside it().
// With vitest `globals: true`, RuleTester registers each case via the global
// describe/it — nesting that inside a running it() silently skips every case.
const ruleTester = new RuleTester({ plugins: { css }, language: 'css/css' });

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
        // border shorthand: border-scope token is the correct scope
        { code: '.x { border: 1px solid var(--vapor-color-border-normal); }' },
        // border shorthand: size token = width usage — no borderWidth scope
        // exists to validate against, must not be flagged as a mismatch
        {
            code: '.x { border: var(--vapor-size-space-100) solid var(--vapor-color-border-normal); }',
        },
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
        // background-scope token on color property with a foreground candidate.
        // --vapor-color-background-contrast-200 shares its light hex (gray.800)
        // with several fg tokens, but only --vapor-color-foreground-contrast-200
        // also matches in dark mode — the others would render differently there.
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
                        candidates: '--vapor-color-foreground-contrast-200',
                    },
                    suggestions: [
                        {
                            messageId: 'replaceWithToken',
                            data: { candidate: '--vapor-color-foreground-contrast-200' },
                            output: '.x { color: var(--vapor-color-foreground-contrast-200); }',
                        },
                    ],
                },
            ],
        },
        // Token reference inside a var() fallback is still scope-checked
        // (raw fallback literals are exempt, token usage is not)
        {
            code: '.x { color: var(--brand-color, var(--vapor-color-background-primary-100)); }',
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
        // border shorthand: foreground-scope color token — wrong scope.
        // No border-scope token shares fg-primary's hex → plain scopeMismatch.
        {
            code: '.x { border: 1px solid var(--vapor-color-foreground-primary-100); }',
            errors: [
                {
                    messageId: 'scopeMismatch',
                    data: {
                        token: '--vapor-color-foreground-primary-100',
                        tokenScope: 'foreground',
                        property: 'border',
                        expectedScopes: 'border',
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
                    suggestions: [
                        {
                            messageId: 'replaceWithToken',
                            data: { candidate: '--vapor-size-borderRadius-300' },
                            output: '.x { border-radius: var(--vapor-size-borderRadius-300); }',
                        },
                    ],
                },
            ],
        },
    ],
});
