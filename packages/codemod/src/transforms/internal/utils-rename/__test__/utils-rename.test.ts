const { defineTransformTests } = require('~/utils/test-utils');

const tests = [
    'rename-component-with-split',
    'rename-component-with-merge',
    'rename-component-with-alias',
];

defineTransformTests('internal/utils-rename', tests);
