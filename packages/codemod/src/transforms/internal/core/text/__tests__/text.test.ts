const { defineTransformTests } = require('~/utils/test-utils');

const tests = [
    'text-import-only',
    'text-mixed-imports',
    'text-existing-vapor-import',
    'text-props-migration',
    'text-aschild-migration',
    'text-color-mapping',
    'text-edge-cases',
];

defineTransformTests('internal/core/text', tests);
