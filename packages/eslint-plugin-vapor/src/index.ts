import type { Rule } from 'eslint';

import { ariaLabelOnIconButtonRule } from './rules/aria-label-on-icon-button';
import { ariaLabelOnNavigationRule } from './rules/aria-label-on-navigation';

const rules = {
    'icon-button-has-aria-label': ariaLabelOnIconButtonRule,
    'navigation-has-aria-label': ariaLabelOnNavigationRule,
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
            'vapor/icon-button-has-aria-label': 'error',
            'vapor/navigation-has-aria-label': 'error',
        },
    },
    legacy: {
        plugins: ['vapor'],
        rules: {
            'vapor/icon-button-has-aria-label': 'error',
            'vapor/navigation-has-aria-label': 'error',
        },
    },
});

export default plugin;
