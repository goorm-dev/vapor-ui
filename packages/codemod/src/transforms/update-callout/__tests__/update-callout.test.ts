const { defineTransformTests } = require('~/utils/test-utils');

const tests = [
    'update-callout-basic',
    'update-callout-render-props',
    'update-callout-self-closing',
    'update-callout-self-closing-aschild',
    'update-callout-expression',
    'update-callout-no-icon',
];

defineTransformTests('update-callout', tests);
