import path from 'node:path';

import { describe, expect, it } from 'vitest';
import { TypeFormatFlags } from 'ts-morph';

import { addSourceFiles, createProject } from '~/core/project';

const FIXTURES_DIR = path.join(__dirname, 'fixtures');
const TABS_PATH = '/Users/goorm/design-system/gds/vapor-ui/packages/core/src/components/tabs/tabs.tsx';

describe('TypeFormatFlags 실험', () => {
    function setup(fileName: string) {
        const tsconfigPath = path.join(FIXTURES_DIR, 'tsconfig.json');
        const project = createProject(tsconfigPath);
        const [sourceFile] = addSourceFiles(project, [path.join(FIXTURES_DIR, fileName)]);
        return { project, sourceFile };
    }

    it('simple-component.tsx Props 타입 비교', () => {
        const { sourceFile } = setup('simple-component.tsx');

        // SimpleButton namespace에서 Props interface 찾기
        const namespace = sourceFile
            .getModules()
            .find((m) => m.getName() === 'SimpleButton');
        const propsInterface = namespace?.getInterface('Props');

        if (!propsInterface) {
            throw new Error('Props interface not found');
        }

        const propsType = propsInterface.getType();
        const properties = propsType.getProperties();

        console.log('\n=== TypeFormatFlags 비교 ===\n');

        for (const prop of properties.slice(0, 10)) {
            // 처음 10개만
            const name = prop.getName();
            const type = prop.getTypeAtLocation(propsInterface);

            // 1. 기본 getText()
            const basic = type.getText();

            // 2. TypeFormatFlags 적용
            const withFlags = type.getText(
                propsInterface,
                TypeFormatFlags.UseAliasDefinedOutsideCurrentScope |
                    TypeFormatFlags.NoTruncation |
                    TypeFormatFlags.WriteTypeArgumentsOfSignature,
            );

            if (basic !== withFlags) {
                console.log(`[${name}]`);
                console.log(`  기본: ${basic}`);
                console.log(`  플래그: ${withFlags}`);
                console.log('');
            }
        }

        expect(true).toBe(true);
    });

    it('React.Ref 타입이 alias로 유지되는지 확인', () => {
        const { sourceFile } = setup('simple-component.tsx');

        const namespace = sourceFile.getModules().find((m) => m.getName() === 'SimpleButton');
        const propsInterface = namespace?.getInterface('Props');

        if (!propsInterface) {
            throw new Error('Props interface not found');
        }

        const propsType = propsInterface.getType();
        const refProp = propsType.getProperty('ref');

        if (refProp) {
            const refType = refProp.getTypeAtLocation(propsInterface);

            const basic = refType.getText();
            const withFlags = refType.getText(
                propsInterface,
                TypeFormatFlags.UseAliasDefinedOutsideCurrentScope | TypeFormatFlags.NoTruncation,
            );

            console.log('\n=== ref 타입 비교 ===');
            console.log(`기본: ${basic}`);
            console.log(`플래그: ${withFlags}`);

            // UseAliasDefinedOutsideCurrentScope가 React.Ref를 유지하는지 확인
            expect(withFlags).toContain('Ref');
        }
    });

    it('ReactNode/ReactElement alias 유지 확인', () => {
        const { sourceFile } = setup('simple-component.tsx');

        const namespace = sourceFile.getModules().find((m) => m.getName() === 'SimpleButton');
        const propsInterface = namespace?.getInterface('Props');

        if (!propsInterface) {
            throw new Error('Props interface not found');
        }

        const propsType = propsInterface.getType();

        // icon prop (ReactNode)
        const iconProp = propsType.getProperty('icon');
        if (iconProp) {
            const iconType = iconProp.getTypeAtLocation(propsInterface);
            const withFlags = iconType.getText(
                propsInterface,
                TypeFormatFlags.UseAliasDefinedOutsideCurrentScope | TypeFormatFlags.NoTruncation,
            );
            console.log('\n=== icon (ReactNode) ===');
            console.log(`플래그: ${withFlags}`);
        }

        // endContent prop (ReactElement)
        const endContentProp = propsType.getProperty('endContent');
        if (endContentProp) {
            const endContentType = endContentProp.getTypeAtLocation(propsInterface);
            const withFlags = endContentType.getText(
                propsInterface,
                TypeFormatFlags.UseAliasDefinedOutsideCurrentScope | TypeFormatFlags.NoTruncation,
            );
            console.log('\n=== endContent (ReactElement) ===');
            console.log(`플래그: ${withFlags}`);
        }
    });

    it('tabs.tsx base-ui 타입 비교', () => {
        const tsconfigPath =
            '/Users/goorm/design-system/gds/vapor-ui/packages/core/tsconfig.json';
        const project = createProject(tsconfigPath);
        const [sourceFile] = addSourceFiles(project, [TABS_PATH]);

        // TabsRoot namespace에서 Props interface 찾기
        const namespace = sourceFile.getModules().find((m) => m.getName() === 'TabsRoot');
        const propsInterface = namespace?.getInterface('Props');

        if (!propsInterface) {
            throw new Error('TabsRoot.Props interface not found');
        }

        const propsType = propsInterface.getType();
        const properties = propsType.getProperties();

        console.log('\n=== tabs.tsx TypeFormatFlags 비교 ===\n');

        // 주요 props만 확인
        const targetProps = ['render', 'onValueChange', 'className', 'defaultValue', 'value'];

        for (const prop of properties) {
            const name = prop.getName();
            if (!targetProps.includes(name)) continue;

            const type = prop.getTypeAtLocation(propsInterface);

            // 1. 기본 getText()
            const basic = type.getText();

            // 2. TypeFormatFlags 적용
            const withFlags = type.getText(
                propsInterface,
                TypeFormatFlags.UseAliasDefinedOutsideCurrentScope |
                    TypeFormatFlags.NoTruncation |
                    TypeFormatFlags.WriteTypeArgumentsOfSignature,
            );

            console.log(`[${name}]`);
            console.log(`  기본: ${basic.slice(0, 200)}${basic.length > 200 ? '...' : ''}`);
            console.log(
                `  플래그: ${withFlags.slice(0, 200)}${withFlags.length > 200 ? '...' : ''}`,
            );
            console.log('');
        }

        expect(true).toBe(true);
    });
});
