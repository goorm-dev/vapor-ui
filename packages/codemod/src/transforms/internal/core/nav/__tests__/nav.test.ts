const { defineTransformTests } = require('~/utils/test-utils');

const tests = [
    'nav-basic',
    'nav-link-active',
    'nav-props-type',
    'nav-link-align',
    'nav-aria-label-exists',
    'nav-with-asChild',
    'nav-mixed-imports',
    'nav-merge-into-existing',
    'nav-multiple',
    'nav-vertical',
    'nav-disabled-link',
    'nav-with-spread',
    'nav-complex',
];

defineTransformTests('internal/core/nav', tests);
