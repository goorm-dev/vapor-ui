import type { Rule } from 'eslint';

import { altTextOnAvatarRule } from './rules/alt-text-on-avatar';
import { ariaLabelOnIconButtonRule } from './rules/aria-label-on-icon-button';
import { ariaLabelOnNavigationRule } from './rules/aria-label-on-navigation';
import { noInvalidDesignTokenRule } from './rules/no-invalid-design-token';
import { preferDesignTokenRule } from './rules/prefer-design-token';
import { shouldHaveTitleOnDialogRule } from './rules/should-have-title-on-dialog';
import { tokenScopeMismatchRule } from './rules/token-scope-mismatch';

const rules = {
    'icon-button-has-aria-label': ariaLabelOnIconButtonRule,
    'navigation-has-aria-label': ariaLabelOnNavigationRule,
    'avatar-has-alt-text': altTextOnAvatarRule,
    'dialog-should-have-title': shouldHaveTitleOnDialogRule,
    'no-invalid-design-token': noInvalidDesignTokenRule,
    'token-scope-mismatch': tokenScopeMismatchRule,
    'prefer-design-token': preferDesignTokenRule,
} satisfies Record<string, Rule.RuleModule>;

type RuleName = `vapor/${keyof typeof rules}`;

const a11yRecommended = {
    'vapor/icon-button-has-aria-label': 'error',
    'vapor/navigation-has-aria-label': 'error',
    'vapor/avatar-has-alt-text': 'error',
    'vapor/dialog-should-have-title': 'error',
} as Record<RuleName, 'error' | 'warn' | 'off'>;

const cssRecommended = {
    'vapor/no-invalid-design-token': 'error',
    'vapor/token-scope-mismatch': 'error',
    'vapor/prefer-design-token': 'warn',
} as Record<RuleName, 'error' | 'warn' | 'off'>;

const plugin = {
    meta: {
        name: 'eslint-plugin-vapor',
        version: '0.1.0',
    },
    rules,
    configs: {
        flat: {
            a11y: { recommended: {} },
            css: { recommended: {} },
        },
        legacy: {
            recommended: {},
        },
    },
};

Object.assign(plugin.configs, {
    flat: {
        a11y: {
            recommended: {
                files: ['**/*.{js,jsx,ts,tsx}'],
                plugins: { vapor: plugin },
                rules: a11yRecommended,
            },
        },
        css: {
            recommended: {
                files: ['**/*.css', '**/*.scss'],
                plugins: { vapor: plugin },
                language: 'css/css',
                rules: cssRecommended,
            },
        },
    },
    legacy: {
        recommended: {
            plugins: ['vapor'],
            overrides: [
                {
                    files: ['*.js', '*.jsx', '*.ts', '*.tsx'],
                    rules: a11yRecommended,
                },
            ],
        },
    },
});

export default plugin;
