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

function setupSortingTest() {
    const tsconfigPath = path.join(FIXTURES_DIR, 'tsconfig.json');
    const project = createProject(tsconfigPath);
    const [sourceFile] = addSourceFiles(project, [path.join(FIXTURES_DIR, 'sorting-test.tsx')]);
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

    describe('React type alias preservation', () => {
        it('should preserve ReactNode type without expanding', () => {
            const result = setupSimpleComponent();
            const simpleButton = result.props.find((p) => p.name === 'SimpleButton');
            const iconProp = simpleButton?.props.find((p) => p.name === 'icon');

            // ReactNode should be preserved as-is, not expanded to union
            expect(iconProp).toBeDefined();
            expect(iconProp?.type).toEqual(['ReactNode']);
        });

        it('should preserve ReactElement type without expanding', () => {
            const result = setupSimpleComponent();
            const simpleButton = result.props.find((p) => p.name === 'SimpleButton');
            const endContentProp = simpleButton?.props.find((p) => p.name === 'endContent');

            // ReactElement should be preserved as-is
            expect(endContentProp).toBeDefined();
            expect(endContentProp?.type).toEqual(['ReactElement']);
        });
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

    describe('props sorting order', () => {
        it('should sort required props first', () => {
            const result = setupSortingTest();
            const sortingTest = result.props.find((p) => p.name === 'SortingTest');

            expect(sortingTest).toBeDefined();
            const propNames = sortingTest!.props.map((p) => p.name);

            // Required prop 'id' should be first
            expect(propNames[0]).toBe('id');
        });

        it('should sort composition props (asChild, render) last', () => {
            const result = setupSortingTest();
            const sortingTest = result.props.find((p) => p.name === 'SortingTest');

            expect(sortingTest).toBeDefined();
            const propNames = sortingTest!.props.map((p) => p.name);

            // Composition props should be at the end (asChild before render alphabetically)
            expect(propNames[propNames.length - 2]).toBe('asChild');
            expect(propNames[propNames.length - 1]).toBe('render');
        });

        it('should sort state props before custom props', () => {
            const result = setupSortingTest();
            const sortingTest = result.props.find((p) => p.name === 'SortingTest');

            expect(sortingTest).toBeDefined();
            const propNames = sortingTest!.props.map((p) => p.name);

            const valueIndex = propNames.indexOf('value');
            const onChangeIndex = propNames.indexOf('onChange');
            const customPropIndex = propNames.indexOf('customProp');
            const labelIndex = propNames.indexOf('label');

            // State props should come before custom props
            expect(valueIndex).toBeLessThan(customPropIndex);
            expect(onChangeIndex).toBeLessThan(customPropIndex);
            expect(valueIndex).toBeLessThan(labelIndex);
        });

        it('should sort alphabetically within same category', () => {
            const result = setupSortingTest();
            const sortingTest = result.props.find((p) => p.name === 'SortingTest');

            expect(sortingTest).toBeDefined();
            const propNames = sortingTest!.props.map((p) => p.name);

            // Custom props should be alphabetically sorted
            const customPropIndex = propNames.indexOf('customProp');
            const labelIndex = propNames.indexOf('label');
            expect(customPropIndex).toBeLessThan(labelIndex);

            // State props should be alphabetically sorted
            const defaultOpenIndex = propNames.indexOf('defaultOpen');
            const onChangeIndex = propNames.indexOf('onChange');
            const onOpenChangeIndex = propNames.indexOf('onOpenChange');
            const openIndex = propNames.indexOf('open');
            const valueIndex = propNames.indexOf('value');

            expect(defaultOpenIndex).toBeLessThan(onChangeIndex);
            expect(onChangeIndex).toBeLessThan(onOpenChangeIndex);
            expect(onOpenChangeIndex).toBeLessThan(openIndex);
            expect(openIndex).toBeLessThan(valueIndex);
        });

        it('should follow category order: required > variants > state > custom > composition', () => {
            const result = setupSortingTest();
            const sortingTest = result.props.find((p) => p.name === 'SortingTest');

            expect(sortingTest).toBeDefined();
            const propNames = sortingTest!.props.map((p) => p.name);

            // Required: id
            const idIndex = propNames.indexOf('id');
            // Variants: size, variant
            const sizeIndex = propNames.indexOf('size');
            const variantIndex = propNames.indexOf('variant');
            // State: defaultOpen, onChange, onOpenChange, open, value
            const valueIndex = propNames.indexOf('value');
            // Custom: customProp, label
            const customPropIndex = propNames.indexOf('customProp');
            // Composition: asChild, render
            const asChildIndex = propNames.indexOf('asChild');

            // Verify category order
            expect(idIndex).toBeLessThan(sizeIndex);
            expect(sizeIndex).toBeLessThan(valueIndex);
            expect(valueIndex).toBeLessThan(customPropIndex);
            expect(customPropIndex).toBeLessThan(asChildIndex);

            // Variants alphabetically sorted
            expect(sizeIndex).toBeLessThan(variantIndex);
        });
    });
});
