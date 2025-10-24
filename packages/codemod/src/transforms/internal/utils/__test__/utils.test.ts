const { defineTransformTests } = require('~/utils/test-utils');

const tests = [
    'only-one-component-import-from-package',
    'two-component-import-from-package',
    'merge-with-existing-target-import',
    'alias-import',
];

defineTransformTests('internal/utils', tests);
