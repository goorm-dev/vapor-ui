import * as fs from 'fs';
import { globby } from 'globby';
import { kebabCase } from 'lodash-es';
import * as path from 'path';
import prettier from 'prettier';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { extractComponentTypesFromFile } from '~/type';

import { RunOptions } from '../types';

export function createCliCommand(runFunction: (options: RunOptions) => Promise<void>) {
    return yargs(hideBin(process.argv))
        .command<RunOptions>(
            '$0',
            'Extracts the API descriptions from a set of files',
            buildCommandOptions,
            runFunction,
        )
        .help()
        .strict()
        .version(false);
}

function buildCommandOptions(command: any) {
    return command
        .option('configPath', {
            alias: 'c',
            type: 'string',
            demandOption: true,
            description: 'The path to the tsconfig.json file',
        })
        .option('out', {
            alias: 'o',
            demandOption: true,
            type: 'string',
            description: 'The output directory.',
        })
        .option('files', {
            alias: 'f',
            type: 'array',
            demandOption: false,
            description:
                'The files to extract the API descriptions from. If not provided, all files in the tsconfig.json are used. You can use globs like `src/**/*.{ts,tsx}` and `!**/*.test.*`. Paths are relative to the tsconfig.json file.',
        })
        .option('includeExternal', {
            alias: 'e',
            type: 'boolean',
            default: false,
            description: 'Include props defined outside of the project',
        })
        .option('externalTypePaths', {
            alias: 'x',
            type: 'array',
            default: ['@base-ui-components/react:esm/index.d.ts'],
            description: 'External type definition files to include (format: package:subpath)',
        });
}

export async function main(options: RunOptions) {
    try {
        const { configPath, out: outputPath } = options;
        const configDir = path.dirname(configPath);

        // Resolve glob patterns to actual file paths
        let resolvedFiles: string[] = [];
        if (options.files && options.files.length > 0) {
            const patterns = options.files;
            resolvedFiles = await globby(patterns, {
                cwd: configDir,
                absolute: false,
                onlyFiles: true,
            });
        }

        if (resolvedFiles.length > 0) {
            for (const file of resolvedFiles) {
                const fullPath = path.resolve(configDir, file);
                const components = extractComponentTypesFromFile(
                    configPath,
                    fullPath,
                    undefined,
                    options.externalTypePaths,
                );

                console.log(`발견된 컴포넌트 수: ${components.length}`);

                // 출력 디렉토리 생성
                if (!fs.existsSync(outputPath)) {
                    fs.mkdirSync(outputPath, { recursive: true });
                    console.log(`출력 디렉토리 생성: ${outputPath}`);
                }

                for (const [_, component] of components.entries()) {
                    const fileName = `${kebabCase(component.name)}.json`;
                    const componentOutputPath = path.join(outputPath, fileName);

                    const componentData = {
                        name: component.name,
                        displayName: component.displayName,
                        description: component.description,
                        props: component.props.map((prop) => ({
                            name: prop.name,
                            type: prop.type,
                            required: prop.required,
                            description: prop.description,
                            defaultValue: prop.defaultValue,
                        })),
                        defaultElement: component.defaultElement,
                        generatedAt: new Date().toISOString(),
                        sourceFile: file,
                    };

                    const jsonString = JSON.stringify(componentData, null, 2);
                    const prettierOptions =
                        (await prettier.resolveConfig(componentOutputPath)) || {};
                    const formattedJson = await prettier.format(jsonString, {
                        ...prettierOptions,
                        parser: 'json',
                    });

                    fs.writeFileSync(componentOutputPath, formattedJson, 'utf8');
                    console.log(`   → JSON 저장: ${componentOutputPath}`);
                }
            }
        } else {
            console.log(
                '분석할 파일이 지정되지 않았습니다. -f 옵션을 사용하여 파일을 지정해주세요.',
            );
        }

        console.log('\n타입 추출 완료!');
    } catch (error) {
        console.error('타입 추출 중 오류 발생:', error);
        process.exit(1);
    }
}

createCliCommand(main).parse();
