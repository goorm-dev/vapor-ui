const { defineTransformTests } = require('~/utils/test-utils');

const tests = [
    'avatar-basic',
    'avatar-square-false',
    'avatar-square-true',
    'avatar-square-shorthand',
    'avatar-square-string',
    'avatar-square-expression',
    'avatar-with-image',
    'avatar-image-with-other-children',
    'avatar-image-with-text',
    'avatar-with-text-children',
    'avatar-with-jsx-children',
    'avatar-with-expression-children',
    'avatar-multiple',
    'avatar-import-merge',
    'avatar-all-sizes',
    'avatar-with-classname',
    'avatar-with-spread',
];

defineTransformTests('internal/core/avatar', tests);
