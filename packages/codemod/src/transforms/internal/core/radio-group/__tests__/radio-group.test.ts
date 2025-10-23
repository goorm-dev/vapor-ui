const { defineTransformTests } = require('~/utils/test-utils');

const tests = [
    'radio-group-basic',
    'radio-group-with-label',
    'radio-group-props',
    'radio-group-disabled-item',
    'radio-group-multiple',
    'radio-group-merge-imports',
    'radio-group-spread',
    'radio-group-no-label',
    'radio-group-with-other-components',
    'radio-group-expression',
    'radio-group-self-closing',
    'radio-group-label-only',
    'radio-group-empty-item',
    'radio-group-mixed-children',
    'radio-group-disabled-no-attrs',
    'radio-group-item-attrs-indicator',
    'radio-group-custom-component',
];

defineTransformTests('internal/core/radio-group', tests);
