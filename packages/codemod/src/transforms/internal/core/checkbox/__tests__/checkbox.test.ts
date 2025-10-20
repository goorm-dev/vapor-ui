const { defineTransformTests } = require('~/utils/test-utils');

const tests = [
    'checkbox-basic',
    'checkbox-with-props',
    'checkbox-with-indicator',
    'checkbox-mixed-imports',
    'checkbox-existing-vapor-import',
    'checkbox-merge-into-vapor-import',
    'checkbox-already-in-vapor-import',
    'checkbox-self-closing',
    'checkbox-with-label',
    'checkbox-with-label-component',
    'checkbox-label-with-props',
    'checkbox-with-alias',
    'checkbox-with-asChild',
    'checkbox-asChild-with-props',
];

defineTransformTests('internal/core/checkbox', tests);
