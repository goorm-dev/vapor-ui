import css from '@eslint/css';
import { RuleTester } from 'eslint';

import { preferDesignTokenRule } from './prefer-design-token';

// NOTE: ruleTester.run must be called at the top level, NOT inside it().
// With vitest `globals: true`, RuleTester registers each case via the global
// describe/it — nesting that inside a running it() silently skips every case.
const ruleTester = new RuleTester({ plugins: { css }, language: 'css/css' });

ruleTester.run('prefer-design-token', preferDesignTokenRule, {
    valid: [
        // Already a semantic token — no report
        { code: '.x { color: var(--vapor-color-foreground-primary-100); }' },
        // Unknown raw color (not in token index) — no candidate, skip
        { code: '.x { color: red; }' },
        // Default ignoreValues — skip 0
        { code: '.x { padding: 0; }' },
        // Default ignoreValues — skip transparent
        { code: '.x { color: transparent; }' },
        // Unknown property — not in PROPERTY_SCOPE, skip
        { code: '.x { unknown-prop: #ffffff; }' },
        // ignoreProperties option — skip color
        { code: '.x { color: #ffffff; }', options: [{ ignoreProperties: ['color'] }] },
        // font-size not in PROPERTY_SCOPE — skip
        { code: '.x { font-size: 12px; }' },
        // ignoreValues override: #ffffff is in list — skip
        {
            code: '.x { background-color: #ffffff; }',
            options: [{ ignoreValues: ['#ffffff'] }],
        },
        // Dark-mode-only hex (#242424 is background-canvas-100's DARK value,
        // not any token's light value) — suggesting a token here would
        // silently change the rendered color in light mode
        { code: '.x { background-color: #242424; }' },
        // #720402 is the dark value of red-100/orange-100 — same reason
        { code: '.x { color: #720402; }' },
        // Primitive whose light hex matches semantic tokens only in light mode:
        // white stays #ffffff in dark, but background-canvas/overlay change.
        // No dark-safe candidate → no report.
        { code: '.x { background-color: var(--vapor-color-white); }' },
        // border shorthand: red-500 shares its light hex with border-danger
        // but their dark values differ — no dark-safe candidate → no report.
        { code: '.x { border: 1px solid var(--vapor-color-red-500); }' },
        // border shorthand: the 1px width part must not trigger the
        // dimension branch (border scope is not a foundation scope).
        { code: '.x { border: 1px solid var(--vapor-color-border-normal); }' },
        // Raw values in a var() fallback are the author's intentional
        // last-resort literal — never rewritten to a token
        { code: '.x { color: var(--brand-color, #0958c9); }' },
        { code: '.x { width: var(--custom-width, 12px); }' },
    ],
    invalid: [
        // C-1: primitive token with semantic upgrade available
        {
            code: '.x { color: var(--vapor-color-blue-600); }',
            errors: [
                {
                    messageId: 'preferSemantic',
                    data: {
                        candidate: '--vapor-color-foreground-primary-100',
                        token: '--vapor-color-blue-600',
                        property: 'color',
                    },
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
        // C-2: raw hex on background-color → semantic background token
        {
            code: '.x { background-color: #ffffff; }',
            errors: [
                {
                    messageId: 'preferToken',
                    data: {
                        candidate: '--vapor-color-background-canvas-100',
                        rawValue: '#ffffff',
                        property: 'background-color',
                    },
                    suggestions: [
                        {
                            messageId: 'replaceWithToken',
                            data: { candidate: '--vapor-color-background-canvas-100' },
                            output: '.x { background-color: var(--vapor-color-background-canvas-100); }',
                        },
                        {
                            messageId: 'replaceWithToken',
                            data: { candidate: '--vapor-color-background-overlay-100' },
                            output: '.x { background-color: var(--vapor-color-background-overlay-100); }',
                        },
                    ],
                },
            ],
        },
        // C-2: raw px on width → foundation dimension token
        {
            code: '.x { width: 12px; }',
            errors: [
                {
                    messageId: 'preferToken',
                    data: {
                        candidate: '--vapor-size-dimension-150',
                        rawValue: '12px',
                        property: 'width',
                    },
                    suggestions: [
                        {
                            messageId: 'replaceWithToken',
                            data: { candidate: '--vapor-size-dimension-150' },
                            output: '.x { width: var(--vapor-size-dimension-150); }',
                        },
                    ],
                },
            ],
        },
        // C-2: shorthand — reports two errors (12px → space-150, 8px → space-100)
        {
            code: '.x { padding: 12px 8px; }',
            errors: [
                {
                    messageId: 'preferToken',
                    data: {
                        candidate: '--vapor-size-space-150',
                        rawValue: '12px',
                        property: 'padding',
                    },
                    suggestions: [
                        {
                            messageId: 'replaceWithToken',
                            data: { candidate: '--vapor-size-space-150' },
                            output: '.x { padding: var(--vapor-size-space-150) 8px; }',
                        },
                    ],
                },
                {
                    messageId: 'preferToken',
                    data: {
                        candidate: '--vapor-size-space-100',
                        rawValue: '8px',
                        property: 'padding',
                    },
                    suggestions: [
                        {
                            messageId: 'replaceWithToken',
                            data: { candidate: '--vapor-size-space-100' },
                            output: '.x { padding: 12px var(--vapor-size-space-100); }',
                        },
                    ],
                },
            ],
        },
        // border shorthand: raw hex color part → border-scope semantic token;
        // the 1px width part is ignored
        {
            code: '.x { border: 1px solid #db3643; }',
            errors: [
                {
                    messageId: 'preferToken',
                    data: {
                        candidate: '--vapor-color-border-danger',
                        rawValue: '#db3643',
                        property: 'border',
                    },
                    suggestions: [
                        {
                            messageId: 'replaceWithToken',
                            data: { candidate: '--vapor-color-border-danger' },
                            output: '.x { border: 1px solid var(--vapor-color-border-danger); }',
                        },
                    ],
                },
            ],
        },
        // C-2: case-insensitive hex — #FFFFFF is normalized to #ffffff
        {
            code: '.x { color: #FFFFFF; }',
            errors: [
                {
                    messageId: 'preferToken',
                    data: {
                        candidate: '--vapor-color-foreground-inverse',
                        rawValue: '#FFFFFF',
                        property: 'color',
                    },
                    suggestions: [
                        {
                            messageId: 'replaceWithToken',
                            data: { candidate: '--vapor-color-foreground-inverse' },
                            output: '.x { color: var(--vapor-color-foreground-inverse); }',
                        },
                    ],
                },
            ],
        },
    ],
});
