// @ts-expect-error - jscodeshift only exports CJS
import { applyTransform } from "jscodeshift/dist/testUtils";
import * as fs from "fs";
import * as path from "path";
import * as prettier from "prettier";

const prettierOptions = {
  parser: "typescript" as const,
  tabWidth: 4,
  semi: true,
  singleQuote: true,
  printWidth: 100,
};

export function testTransform(
  transformName: string,
  testCaseName: string
): void {
  const transform = require(`../transforms/${transformName}`);
  const transformDir = path.join(__dirname, "..", "transforms", transformName);
  const inputPath = path.join(
    transformDir,
    "__testfixtures__",
    `${testCaseName}.input.tsx`
  );
  const outputPath = path.join(
    transformDir,
    "__testfixtures__",
    `${testCaseName}.output.tsx`
  );

  const fixture = fs.readFileSync(inputPath, "utf8");
  const expected = fs.readFileSync(outputPath, "utf8");

  const result = applyTransform(
    transform,
    {},
    { source: fixture },
    { parser: "tsx" }
  );
  const formattedResult = prettier.format(result, prettierOptions);

  expect(formattedResult).toEqual(expected);
}

export function defineTransformTests(
  transformName: string,
  testCases: string[]
): void {
  describe(transformName, () => {
    testCases.forEach((testCase) => {
      it(`transforms ${testCase}`, () => {
        testTransform(transformName, testCase);
      });
    });
  });
}
