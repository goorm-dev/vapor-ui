const { defineTransformTests } = require('~/utils/test-utils');

const tests = [
    'switch-basic',
    'switch-with-label',
    'switch-controlled',
    'switch-props',
    'switch-multiple',
    'switch-merge-imports',
    'switch-with-spread',
    'switch-named-import',
    'switch-with-other-components',
    'switch-default-checked',
];
defineTransformTests('internal/core/switch', tests);
