import type { Rule } from 'eslint';

import { altTextOnAvatarRule } from './rules/alt-text-on-avatar';
import { ariaLabelOnIconButtonRule } from './rules/aria-label-on-icon-button';
import { ariaLabelOnNavigationRule } from './rules/aria-label-on-navigation';
import { shouldHaveTitleOnDialogRule } from './rules/should-have-title-on-dialog';

import { noInvalidDesignTokenRule } from './rules/css/no-invalid-design-token';
import { tokenScopeMismatchRule } from './rules/css/token-scope-mismatch';
import { preferDesignTokenRule } from './rules/css/prefer-design-token';

const rules = {
    'icon-button-has-aria-label': ariaLabelOnIconButtonRule,
    'navigation-has-aria-label': ariaLabelOnNavigationRule,
    'avatar-has-alt-text': altTextOnAvatarRule,
    'dialog-should-have-title': shouldHaveTitleOnDialogRule,
    'css/no-invalid-design-token': noInvalidDesignTokenRule,
    'css/token-scope-mismatch': tokenScopeMismatchRule,
    'css/prefer-design-token': preferDesignTokenRule,
} satisfies Record<string, Rule.RuleModule>;

const a11yRecommended = {
    'vapor/icon-button-has-aria-label': 'error',
    'vapor/navigation-has-aria-label': 'error',
    'vapor/avatar-has-alt-text': 'error',
    'vapor/dialog-should-have-title': 'error',
} as const;

const cssRecommended = {
    'vapor/css/no-invalid-design-token': 'error',
    'vapor/css/token-scope-mismatch': 'error',
    'vapor/css/prefer-design-token': 'warn',
} as const;

const plugin = {
    meta: {
        name: 'eslint-plugin-vapor',
        version: '0.1.0',
    },
    rules,
    configs: {
        flat: {},
        legacy: {},
        css: {},
    },
};

Object.assign(plugin.configs, {
    flat: {
        plugins: { vapor: plugin },
        rules: a11yRecommended,
    },
    legacy: {
        plugins: ['vapor'],
        rules: a11yRecommended,
    },
    css: {
        plugins: { vapor: plugin },
        rules: cssRecommended,
    },
});

export default plugin;
