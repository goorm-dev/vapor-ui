import css from '@eslint/css';
import { RuleTester } from 'eslint';
import { describe, it } from 'vitest';

import { preferDesignTokenRule } from './prefer-design-token';

const ruleTester = new RuleTester({ plugins: { css }, language: 'css/css' });

describe('prefer-design-token', () => {
    it('runs', () => {
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
                                candidate: '--vapor-color-background-overlay-100',
                                rawValue: '#ffffff',
                                property: 'background-color',
                            },
                            suggestions: [
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
                        },
                        {
                            messageId: 'preferToken',
                            data: {
                                candidate: '--vapor-size-space-100',
                                rawValue: '8px',
                                property: 'padding',
                            },
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
                        },
                    ],
                },
            ],
        });
    });
});
