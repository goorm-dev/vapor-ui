import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { addSourceFiles, createProject } from '~/core/project';
import { extractProps } from '~/core/props-extractor';

const FIXTURES_DIR = path.join(__dirname, 'fixtures');

function setup() {
    const tsconfigPath = path.join(FIXTURES_DIR, 'tsconfig.json');
    const project = createProject(tsconfigPath);
    const [sourceFile] = addSourceFiles(project, [path.join(FIXTURES_DIR, 'props-sample.tsx')]);
    return extractProps(sourceFile);
}

function setupSimpleComponent() {
    const tsconfigPath = path.join(FIXTURES_DIR, 'tsconfig.json');
    const project = createProject(tsconfigPath);
    const [sourceFile] = addSourceFiles(project, [path.join(FIXTURES_DIR, 'simple-component.tsx')]);
    return extractProps(sourceFile);
}

describe('extractProps', () => {
    it('should find Props interfaces in namespaces', () => {
        const result = setup();

        expect(result.props.length).toBe(4);
        expect(result.props.map((p) => p.name)).toEqual(['Simple', 'Button', 'Dialog', 'TabsList']);
    });

    it('should extract all resolved properties including inherited', () => {
        const result = setup();
        const button = result.props.find((p) => p.name === 'Button');

        expect(button?.props.length).toBeGreaterThan(0);
        expect(button?.props.some((p) => p.name === 'variant')).toBe(true);
        expect(button?.props.some((p) => p.name === 'size')).toBe(true);
    });

    it('should filter out node_modules props by default', () => {
        const tsconfigPath = path.join(FIXTURES_DIR, 'tsconfig.json');
        const project = createProject(tsconfigPath);
        const [sourceFile] = addSourceFiles(project, [path.join(FIXTURES_DIR, 'props-sample.tsx')]);

        const result = extractProps(sourceFile, { filterExternal: true });
        const button = result.props.find((p) => p.name === 'Button');

        expect(button?.props.some((p) => p.name === 'variant')).toBe(true);
        expect(button?.props.some((p) => p.name === 'size')).toBe(true);
    });

    it('should extract component description from JSDoc', () => {
        const result = setupSimpleComponent();
        const simpleButton = result.props.find((p) => p.name === 'SimpleButton');

        expect(simpleButton?.description).toBe('A simple button component for testing.');
    });

    describe('declaration-based filtering', () => {
        it('should filter React HTML attributes by declaration source when filterExternal is true', () => {
            const tsconfigPath = path.join(FIXTURES_DIR, 'tsconfig.json');
            const project = createProject(tsconfigPath);
            const [sourceFile] = addSourceFiles(project, [
                path.join(FIXTURES_DIR, 'simple-component.tsx'),
            ]);

            const result = extractProps(sourceFile, { filterExternal: true });
            const simpleButton = result.props.find((p) => p.name === 'SimpleButton');

            // React.ButtonHTMLAttributes에서 온 props는 제외됨
            expect(simpleButton?.props.some((p) => p.name === 'onClick')).toBe(false);
            expect(simpleButton?.props.some((p) => p.name === 'disabled')).toBe(false);
            expect(simpleButton?.props.some((p) => p.name === 'type')).toBe(false);

            // 직접 정의한 variants props는 포함됨
            expect(simpleButton?.props.some((p) => p.name === 'colorPalette')).toBe(true);
            expect(simpleButton?.props.some((p) => p.name === 'size')).toBe(true);
            expect(simpleButton?.props.some((p) => p.name === 'variant')).toBe(true);
        });

        it('should include all props when filterExternal and filterHtml are false', () => {
            const tsconfigPath = path.join(FIXTURES_DIR, 'tsconfig.json');
            const project = createProject(tsconfigPath);
            const [sourceFile] = addSourceFiles(project, [
                path.join(FIXTURES_DIR, 'simple-component.tsx'),
            ]);

            // filterExternal과 filterHtml 모두 비활성화하면 React props 포함
            const result = extractProps(sourceFile, { filterExternal: false, filterHtml: false });
            const simpleButton = result.props.find((p) => p.name === 'SimpleButton');

            expect(simpleButton?.props.some((p) => p.name === 'onClick')).toBe(true);
            expect(simpleButton?.props.some((p) => p.name === 'disabled')).toBe(true);
        });
    });
});
