import prettier from '@prettier/sync';
import type { Transform } from 'jscodeshift';
import { applyTransform } from 'jscodeshift/src/testUtils.js';
import { readFileSync, readdirSync } from 'node:fs';
import path, { basename, dirname, join } from 'node:path';

interface RunFixtureTestsOptions {
    transform: Transform;
    fixturesDir: string;
    extensions?: string[];
    transformOptions?: Record<string, unknown>;
    name?: string;
}
export const runTestTransform = ({
    transform,
    fixturesDir,
    extensions = ['tsx'],
    transformOptions = {},
    name,
}: RunFixtureTestsOptions): void => {
    const transformName = name || basename(dirname(fixturesDir));

    const inputFiles = extensions.flatMap((extension) => {
        return readdirSync(fixturesDir)
            .filter((file) => file.endsWith(`.input.${extension}`))
            .map((file) => ({
                testCase: basename(file, `.input.${extension}`),
                extension,
            }));
    });

    describe(`Transform: ${transformName}`, () => {
        inputFiles.forEach(({ testCase, extension }) => {
            test(`${testCase} ${extension}`, () => {
                const inputFilePath = `${fixturesDir}/${testCase}.input.${extension}`;
                const outputFilePath = join(fixturesDir, `${testCase}.output.${extension}`);

                const input = readFileSync(inputFilePath, 'utf-8');
                const output = readFileSync(outputFilePath, 'utf8').trim();
                const cleanRegex = /\/\/\s*@ts-nocheck\s*\r?\n?/;

                const result = applyTransform(
                    transform,
                    transformOptions,
                    { source: input },
                    { parser: 'tsx' },
                );
                const config = prettier.resolveConfig(path.join(process.cwd(), '.prettierrc'));

                expect(
                    prettier
                        .format(result, {
                            parser: 'typescript',
                            ...config,
                        })
                        .replace(cleanRegex, ''),
                ).toEqual(
                    prettier
                        .format(output, {
                            parser: 'typescript',
                            ...config,
                        })
                        .replace(cleanRegex, ''),
                );
            });
        });
    });
};
