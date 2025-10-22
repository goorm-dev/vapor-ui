const { defineTransformTests } = require('~/utils/test-utils');

const tests = [
    'dropdown-basic',
    'dropdown-with-portal',
    'dropdown-with-contents',
    'dropdown-with-combined-content',
    'dropdown-with-group',
    'dropdown-with-divider',
    'dropdown-with-submenu',
    'dropdown-props-side-align',
    'dropdown-props-maxheight',
    'dropdown-with-asChild',
    'dropdown-mixed-imports',
    'dropdown-multiple',
    'dropdown-with-other-imports',
    'dropdown-maxheight-with-style',
    'dropdown-with-spread',
    'dropdown-subcombinedcontent',
    'dropdown-merge-into-existing',
    'dropdown-portal-forceMount',
];

defineTransformTests('internal/core/dropdown', tests);
