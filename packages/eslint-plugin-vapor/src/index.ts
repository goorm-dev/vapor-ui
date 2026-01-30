import type { Rule } from 'eslint';

import { altTextOnAvatarRule } from './rules/alt-text-on-avatar';
import { ariaLabelOnIconButtonRule } from './rules/aria-label-on-icon-button';
import { ariaLabelOnNavigationRule } from './rules/aria-label-on-navigation';
import { shouldHaveTitleOnDialogRule } from './rules/should-have-title-on-dialog';

const rules = {
    'icon-button-has-aria-label': ariaLabelOnIconButtonRule,
    'navigation-has-aria-label': ariaLabelOnNavigationRule,
    'avatar-has-alt-text': altTextOnAvatarRule,
    'dialog-should-have-title': shouldHaveTitleOnDialogRule,
} satisfies Record<string, Rule.RuleModule>;

// Define the flat config (recommended)
const recommended = Object.fromEntries(
    Object.keys(rules).map((ruleName) => [`vapor/${ruleName}`, 'error']),
);

const plugin = {
    meta: {
        name: 'eslint-plugin-vapor',
        version: '0.1.0',
    },
    rules,
    configs: {
        flat: {},
        legacy: {},
    },
};

Object.assign(plugin.configs, {
    flat: {
        plugins: { vapor: plugin },
        rules: recommended,
    },
    legacy: {
        plugins: ['vapor'],
        rules: recommended,
    },
});

export default plugin;
