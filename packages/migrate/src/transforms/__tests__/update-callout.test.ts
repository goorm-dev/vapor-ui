'use strict';

const defineTest = require('jscodeshift/dist/testUtils').defineTest;

const tests = ['update-callout-render-props'];

describe('update-callout', () => {
    tests.forEach((test) =>
        defineTest(
            __dirname,
            'update-callout',
            {
                parser: 'tsx',
                quote: 'single',
                trailingComma: true,
                tabWidth: 4,
                useTabs: false,
                reuseWhitespace: true,
            },
            `update-callout/${test}`,
        ),
    );
});
