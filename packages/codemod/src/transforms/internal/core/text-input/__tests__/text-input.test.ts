const { defineTransformTests } = require('~/utils/test-utils');

const tests = [
    'text-input-basic',
    'text-input-with-label',
    'text-input-visually-hidden-label',
    'text-input-controlled',
    'text-input-props',
    'text-input-ref',
    'text-input-multiple',
    'text-input-merge-imports',
    'text-input-with-spread',
    'text-input-named-import',
    'text-input-with-other-components',
];

defineTransformTests('internal/core/text-input', tests);
