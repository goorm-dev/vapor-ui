import * as fs from 'fs';
import { kebabCase } from 'lodash-es';
import * as path from 'path';
import prettier from 'prettier';

import { createCliCommand } from './cli.js';
import { extractComponentTypesFromFile } from './lib/type-extractor';
import type { RunOptions } from './types';

async function run(options: RunOptions) {
    console.log('TypeScript Compiler API를 사용한 컴포넌트 타입 추출 시작...');
    console.log('옵션:', options);
    console.log('---');

    try {
        // Get only unique files to avoid processing duplicates from previous runs
        const files = options.files ? [...new Set(options.files)] : [];
        console.log('처리할 파일들:', files);

        // files 옵션이 있으면 각 파일에 대해 타입 추출 실행
        if (files && files.length > 0) {
            for (const file of files) {
                console.log(`\n파일 분석 중: ${file}`);
                console.log('='.repeat(50));

                const configPath = Array.isArray(options.configPath)
                    ? options.configPath[0]
                    : options.configPath;
                const outputPath = Array.isArray(options.out) ? options.out[0] : options.out;
                const fullPath = path.resolve(path.dirname(configPath), file);
                const components = extractComponentTypesFromFile(configPath, fullPath);

                console.log(`발견된 컴포넌트 수: ${components.length}`);

                // 출력 디렉토리 생성
                if (!fs.existsSync(outputPath)) {
                    fs.mkdirSync(outputPath, { recursive: true });
                    console.log(`출력 디렉토리 생성: ${outputPath}`);
                }

                for (const [index, component] of components.entries()) {
                    console.log(`\n${index + 1}. 컴포넌트: ${component.name}`);
                    console.log(`   Display Name: ${component.displayName || 'N/A'}`);
                    console.log(`   설명: ${component.description || 'N/A'}`);
                    console.log(`   Props 수: ${component.props.length}`);

                    if (component.props.length > 0) {
                        console.log('   Props:');
                        component.props.forEach((prop) => {
                            console.log(
                                `     - ${prop.name}: ${prop.type}${prop.required ? ' (필수)' : ' (선택)'}`,
                            );
                            if (prop.description) {
                                console.log(`       설명: ${prop.description}`);
                            }
                            if (prop.defaultValue) {
                                console.log(`       기본값: ${prop.defaultValue}`);
                            }
                        });
                    }

                    // JSON 파일로 저장 - componentname-subcomponent.json 형식
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

// CLI 실행
createCliCommand(run).parse();
