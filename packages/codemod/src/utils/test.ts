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
}

const getParserByExtension = (ext: string) => {
    switch (ext) {
        case 'ts':
        case 'tsx':
            return 'typescript';
        case 'js':
        case 'jsx':
            return 'babel';
        default:
            return 'babel';
    }
};

export const runTestTransform = ({
    transform,
    fixturesDir,
    extensions = ['tsx'],
    transformOptions = {},
}: RunFixtureTestsOptions): void => {
    const transformName = basename(dirname(fixturesDir));

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
                const output = readFileSync(outputFilePath, 'utf8');
                const cleanRegex = /\/\/\s*@ts-nocheck\s*\r?\n?/;

                const result = applyTransform(transform, transformOptions, {
                    source: input,
                });
                const config = {
                    parser: getParserByExtension(extension),
                    ...prettier.resolveConfig(path.join(process.cwd())),
                };
                const formatAndClean = (code: string) => {
                    return prettier.format(code, config).replace(cleanRegex, '');
                };
                expect(formatAndClean(result)).toBe(formatAndClean(output));
            });
        });
    });
};
