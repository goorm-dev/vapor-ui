const { applyTransform } = require('jscodeshift/dist/testUtils');
const fs = require('node:fs');
const path = require('node:path');
const prettier = require('prettier');

const prettierOptions = {
    parser: 'typescript',
    tabWidth: 4,
    semi: true,
    singleQuote: true,
    printWidth: 100,
};

function testTransform(transformName: string, testCaseName: string) {
    const transform = require(`../transforms/${transformName}`);
    const transformDir = path.join(__dirname, '..', 'transforms', transformName);
    const inputPath = path.join(transformDir, '__testfixtures__', `${testCaseName}.input.tsx`);
    const outputPath = path.join(transformDir, '__testfixtures__', `${testCaseName}.output.tsx`);

    const fixture = fs.readFileSync(inputPath, 'utf8');
    const expected = fs.readFileSync(outputPath, 'utf8');

    const result = applyTransform(transform, {}, { source: fixture }, { parser: 'tsx' });
    const formattedResult = prettier.format(result, prettierOptions);

    expect(formattedResult).toEqual(expected);
}

function defineTransformTests(transformName: string, testCases: string[]) {
    describe(transformName, () => {
        testCases.forEach((testCase) => {
            it(`transforms ${testCase}`, () => {
                testTransform(transformName, testCase);
            });
        });
    });
}

module.exports = {
    testTransform,
    defineTransformTests,
};
