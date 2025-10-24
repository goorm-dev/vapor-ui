const { defineTransformTests } = require('~/utils/test-utils');

const tests = [
    'tabs-basic',
    'tabs-with-default-value',
    'tabs-controlled',
    'tabs-props',
    'tabs-disabled',
    'tabs-multiple',
    'tabs-merge-imports',
    'tabs-spread',
    'tabs-vertical',
    'tabs-expression',
    'tabs-force-mount',
    'tabs-with-indicator',
    'tabs-with-stretch-position',
];

defineTransformTests('internal/core/tabs', tests);
