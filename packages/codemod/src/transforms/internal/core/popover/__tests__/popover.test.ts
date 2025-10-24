const { defineTransformTests } = require('~/utils/test-utils');

const tests = [
    'popover-basic',
    'popover-props-side-align',
    'popover-combined-content',
    'popover-with-arrow',
    'popover-with-asChild',
    'popover-portal-forceMount',
    'popover-isArrowVisible',
    'popover-with-anchor',
    'popover-multiple',
    'popover-merge-into-existing',
    'popover-close-asChild',
    'popover-with-spread',
    'popover-disabled-to-trigger',
];

defineTransformTests('internal/core/popover', tests);
