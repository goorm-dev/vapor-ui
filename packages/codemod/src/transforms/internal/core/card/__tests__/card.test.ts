const { defineTransformTests } = require('~/utils/test-utils');

const tests = [
    'card-basic',
    'card-with-title',
    'card-all-sections',
    'card-with-props',
    'card-mixed-imports',
    'card-existing-vapor-import',
    'card-merge-into-vapor-import',
    'card-title-with-props',
    'card-self-closing',
    'card-only-body',
    'card-nested-title',
    'card-multiple-titles',
    'card-with-asChild',
    'card-asChild-with-props',
];

defineTransformTests('internal/core/card', tests);
