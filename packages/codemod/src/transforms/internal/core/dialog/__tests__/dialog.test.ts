const { defineTransformTests } = require('~/utils/test-utils');

const tests = [
    'dialog-basic',
    'dialog-named-import',
    'dialog-with-contents',
    'dialog-with-combined-content',
    'dialog-explicit-portal',
    'dialog-scrim-clickable',
    'dialog-with-props',
    'dialog-mixed-imports',
    'dialog-mixed-with-existing-vapor',
    'dialog-existing-vapor-import',
    'dialog-merge-into-vapor-import',
    'dialog-already-in-vapor-import',
    'dialog-vapor-import-has-dialog',
    'dialog-with-asChild',
    'dialog-asChild-with-props',
    'dialog-portal-with-forceMount',
    'dialog-all-sections',
    'dialog-controlled',
    'dialog-multiple',
];

defineTransformTests('internal/core/dialog', tests);
