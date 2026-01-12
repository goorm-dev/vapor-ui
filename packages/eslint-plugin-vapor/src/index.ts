import type { Rule } from 'eslint';

import { altTextOnAvatarRule } from './rules/alt-text-on-avatar';
import { ariaLabelOnDialogRule } from './rules/aria-label-on-dialog';
import { ariaLabelOnIconButtonRule } from './rules/aria-label-on-icon-button';
import { ariaLabelOnNavigationRule } from './rules/aria-label-on-navigation';

const rules = {
    'dialog-has-aria-label': ariaLabelOnDialogRule,
    'icon-button-has-aria-label': ariaLabelOnIconButtonRule,
    'navigation-has-aria-label': ariaLabelOnNavigationRule,
    'avatar-has-alt-text': altTextOnAvatarRule,
} satisfies Record<string, Rule.RuleModule>;

const plugin = {
    meta: {
        name: 'eslint-plugin-vapor',
        version: '0.1.0',
    },
    rules,
    configs: {},
};

Object.assign(plugin.configs, {
    recommended: {
        plugins: { vapor: plugin },
        rules: {
            'vapor/dialog-has-aria-label': 'error',
            'vapor/icon-button-has-aria-label': 'error',
            'vapor/navigation-has-aria-label': 'error',
            'vapor/avatar-has-alt-text': 'error',
        },
    },
    legacy: {
        plugins: ['vapor'],
        rules: {
            'vapor/dialog-has-aria-label': 'error',
            'vapor/icon-button-has-aria-label': 'error',
            'vapor/navigation-has-aria-label': 'error',
            'vapor/avatar-has-alt-text': 'error',
        },
    },
});

export default plugin;
