const { defineTransformTests } = require('~/utils/test-utils');

const tests = [
    'icon-button-basic',
    'icon-button-rounded-true',
    'icon-button-rounded-explicit-true',
    'icon-button-rounded-false',
    'icon-button-shape-variant',
    'icon-button-rounded-expression',
    'icon-button-all-props',
    'icon-button-import-merge',
    'icon-button-deprecated-props',
    'icon-button-hint-color',
    'icon-button-spread-props',
];

defineTransformTests('internal/core/icon-button', tests);
