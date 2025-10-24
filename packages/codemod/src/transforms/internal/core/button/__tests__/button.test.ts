const { defineTransformTests } = require('~/utils/test-utils');

const tests = [
    'button-variants-change',
    'button-import-only',
    'button-mixed-imports',
    'button-existing-vapor-import',
];

defineTransformTests('internal/core/button', tests);
