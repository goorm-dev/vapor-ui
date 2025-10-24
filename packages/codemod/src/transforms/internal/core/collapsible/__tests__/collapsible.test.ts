const { defineTransformTests } = require('~/utils/test-utils');

const tests = [
    'collapsible-basic',
    'collapsible-with-props',
    'collapsible-content-to-panel',
    'collapsible-with-asChild',
    'collapsible-asChild-with-props',
    'collapsible-mixed-imports',
    'collapsible-existing-vapor-import',
    'collapsible-already-in-vapor-import',
    'collapsible-multiple',
    'collapsible-controlled',
];

defineTransformTests('internal/core/collapsible', tests);
