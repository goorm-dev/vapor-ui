import * as fs from 'fs';
import { globby } from 'globby';
import { kebabCase } from 'lodash-es';
import * as path from 'path';
import prettier from 'prettier';

import { extractComponentTypesFromFile } from './lib/type-extractor';
import type { RunOptions } from './types';

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
                const components = extractComponentTypesFromFile(configPath, fullPath);

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
