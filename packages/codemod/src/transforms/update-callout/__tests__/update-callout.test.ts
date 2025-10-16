const { defineTransformTests } = require('~/utils/test-utils');

const tests = [
    'update-callout-basic',
    'update-callout-render-props',
    'update-callout-self-closing',
    'update-callout-self-closing-aschild',
    'update-callout-expression',
    'update-callout-no-icon',
    'update-callout-multiple-imports',
    'update-callout-vapor-ui-import',
    'update-callout-aschild-no-jsx',
    'update-callout-with-div',
    'update-callout-aschild-empty',
];

defineTransformTests('update-callout', tests);
