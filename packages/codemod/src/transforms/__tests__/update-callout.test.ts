'use strict';

const { defineTest } = require('jscodeshift/dist/testUtils');

const tests = ['update-callout-render-props'];

describe('update-callout', () => {
    tests.forEach((test) =>
        defineTest(
            __dirname,
            'update-callout',
            null,
            `update-callout/${test}`,

            {
                parser: 'tsx',
            },
        ),
    );
});
