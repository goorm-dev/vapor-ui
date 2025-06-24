import { ERROR } from './constants.js';

/** @type {Partial<import('eslint').Linter.RulesRecord>} */
export const rules = {
    'jsx-a11y/alt-text': ERROR,
    'jsx-a11y/anchor-has-content': [ERROR, { components: ['Link', 'NavLink'] }],
    'jsx-a11y/anchor-is-valid': [ERROR, { aspects: ['noHref', 'invalidHref'] }],
    'jsx-a11y/aria-activedescendant-has-tabindex': ERROR,
    'jsx-a11y/aria-props': ERROR,
    'jsx-a11y/aria-proptypes': ERROR,
    'jsx-a11y/aria-role': [ERROR, { ignoreNonDOM: true }],
    'jsx-a11y/aria-unsupported-elements': ERROR,
    'jsx-a11y/iframe-has-title': ERROR,
    'jsx-a11y/img-redundant-alt': ERROR,
    'jsx-a11y/lang': ERROR,
    'jsx-a11y/no-access-key': ERROR,
    'jsx-a11y/no-redundant-roles': ERROR,
    'jsx-a11y/role-has-required-aria-props': ERROR,
    'jsx-a11y/role-supports-aria-props': ERROR,
    'jsx-a11y/click-events-have-key-events': ERROR,
    'jsx-a11y/no-static-element-interactions': ERROR,
    'jsx-a11y/interactive-supports-focus': ERROR,
};

export default rules;
