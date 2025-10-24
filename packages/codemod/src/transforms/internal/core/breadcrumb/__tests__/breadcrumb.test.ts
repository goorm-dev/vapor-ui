const { defineTransformTests } = require('~/utils/test-utils');

const tests = [
    'breadcrumb-basic',
    'breadcrumb-size-change',
    'breadcrumb-mixed-imports',
    'breadcrumb-existing-vapor-import',
    'breadcrumb-with-expression',
    'breadcrumb-with-classname',
];

defineTransformTests('internal/core/breadcrumb', tests);
