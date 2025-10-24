const { defineTransformTests } = require('~/utils/test-utils');

const tests = [
    'alert-basic',
    'alert-self-closing',
    'alert-with-props',
    'alert-all-colors',
    'alert-mixed-imports',
    'alert-existing-vapor-import',
    'alert-no-color',
    'alert-with-expression',
    'alert-duplicate-callout',
    'alert-mixed-with-existing-callout',
    'alert-mixed-with-existing-vapor',
    'alert-with-icon',
    'alert-with-svg',
    'alert-icon-only-text',
    'alert-with-custom-icon',
    'alert-with-non-icon-component',
    'alert-with-asChild',
    'alert-asChild-with-props',
    'alert-asChild-with-icon',
];

defineTransformTests('internal/core/alert', tests);
