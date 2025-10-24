const { defineTransformTests } = require('~/utils/test-utils');

const tests = [
    'badge-variants-change',
    'badge-import-only',
    'badge-mixed-imports',
    'badge-existing-vapor-import',
];

defineTransformTests('internal/core/badge', tests);
