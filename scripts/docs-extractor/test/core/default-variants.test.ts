import path from 'node:path';
import { describe, expect, it } from 'vitest';

import {
    findRecipeUsageInComponent,
    findStyleImports,
    getDefaultValuesForNamespace,
    parseRecipeDefaultVariants,
} from '~/core/default-variants';
import { addSourceFiles, createProject } from '~/core/project';

const FIXTURES_DIR = path.join(__dirname, '../fixtures');

function setupProject() {
    const tsconfigPath = path.join(FIXTURES_DIR, 'tsconfig.json');
    return createProject(tsconfigPath);
}

describe('findStyleImports', () => {
    it('should find wildcard imports from .css files', () => {
        const project = setupProject();
        const [sourceFile] = addSourceFiles(project, [
            path.join(FIXTURES_DIR, 'simple-component.tsx'),
        ]);

        const imports = findStyleImports(sourceFile);

        expect(imports).toHaveLength(1);
        expect(imports[0].localName).toBe('styles');
        expect(imports[0].modulePath).toBe('./simple-component.css');
        expect(imports[0].resolvedPath).toContain('simple-component.css.ts');
    });

    it('should find imports from compound component files', () => {
        const project = setupProject();
        const [sourceFile] = addSourceFiles(project, [
            path.join(FIXTURES_DIR, 'compound-component.tsx'),
        ]);

        const imports = findStyleImports(sourceFile);

        expect(imports).toHaveLength(1);
        expect(imports[0].localName).toBe('styles');
        expect(imports[0].modulePath).toBe('./compound-component.css');
    });

    it('should return empty array when no .css imports exist', () => {
        const project = setupProject();
        const [sourceFile] = addSourceFiles(project, [path.join(FIXTURES_DIR, 'props-sample.tsx')]);

        const imports = findStyleImports(sourceFile);

        expect(imports).toHaveLength(0);
    });
});

describe('findRecipeUsageInComponent', () => {
    it('should find recipe usage within a simple component', () => {
        const project = setupProject();
        const [sourceFile] = addSourceFiles(project, [
            path.join(FIXTURES_DIR, 'simple-component.tsx'),
        ]);

        const recipe = findRecipeUsageInComponent(sourceFile, 'SimpleButton', 'styles');

        expect(recipe).toBe('root');
    });

    it('should find different recipes for different components in compound component', () => {
        const project = setupProject();
        const [sourceFile] = addSourceFiles(project, [
            path.join(FIXTURES_DIR, 'compound-component.tsx'),
        ]);

        const rootRecipe = findRecipeUsageInComponent(sourceFile, 'TabsRoot', 'styles');
        const listRecipe = findRecipeUsageInComponent(sourceFile, 'TabsList', 'styles');
        const buttonRecipe = findRecipeUsageInComponent(sourceFile, 'TabsButton', 'styles');
        const indicatorRecipe = findRecipeUsageInComponent(sourceFile, 'TabsIndicator', 'styles');

        expect(rootRecipe).toBe('root');
        expect(listRecipe).toBe('list');
        expect(buttonRecipe).toBe('button');
        expect(indicatorRecipe).toBe('indicator');
    });

    it('should return null for components that do not exist', () => {
        const project = setupProject();
        const [sourceFile] = addSourceFiles(project, [
            path.join(FIXTURES_DIR, 'simple-component.tsx'),
        ]);

        const recipe = findRecipeUsageInComponent(sourceFile, 'NonExistentComponent', 'styles');

        expect(recipe).toBeNull();
    });

    it('should return null for components without recipe usage', () => {
        const project = setupProject();
        const [sourceFile] = addSourceFiles(project, [path.join(FIXTURES_DIR, 'props-sample.tsx')]);

        const recipe = findRecipeUsageInComponent(sourceFile, 'Simple', 'styles');

        expect(recipe).toBeNull();
    });
});

describe('parseRecipeDefaultVariants', () => {
    it('should parse defaultVariants from simple component css file', () => {
        const project = setupProject();
        addSourceFiles(project, [path.join(FIXTURES_DIR, 'simple-component.css.ts')]);
        const cssFile = project.getSourceFileOrThrow(
            path.join(FIXTURES_DIR, 'simple-component.css.ts'),
        );

        const defaults = parseRecipeDefaultVariants(cssFile, 'root');

        expect(defaults).toEqual({ colorPalette: 'primary', size: 'md', variant: 'fill' });
    });

    it('should parse different recipes from compound component css file', () => {
        const project = setupProject();
        addSourceFiles(project, [path.join(FIXTURES_DIR, 'compound-component.css.ts')]);
        const cssFile = project.getSourceFileOrThrow(
            path.join(FIXTURES_DIR, 'compound-component.css.ts'),
        );

        const rootDefaults = parseRecipeDefaultVariants(cssFile, 'root');
        const listDefaults = parseRecipeDefaultVariants(cssFile, 'list');
        const buttonDefaults = parseRecipeDefaultVariants(cssFile, 'button');
        const indicatorDefaults = parseRecipeDefaultVariants(cssFile, 'indicator');

        expect(rootDefaults).toEqual({ orientation: 'horizontal' });
        expect(listDefaults).toEqual({ variant: 'line', orientation: 'horizontal' });
        expect(buttonDefaults).toEqual({ size: 'md', variant: 'line', orientation: 'horizontal' });
        expect(indicatorDefaults).toEqual({ orientation: 'horizontal', variant: 'line' });
    });

    it('should return null for non-recipe exports', () => {
        const project = setupProject();
        addSourceFiles(project, [path.join(FIXTURES_DIR, 'compound-component.css.ts')]);
        const cssFile = project.getSourceFileOrThrow(
            path.join(FIXTURES_DIR, 'compound-component.css.ts'),
        );

        const defaults = parseRecipeDefaultVariants(cssFile, 'icon');

        expect(defaults).toBeNull();
    });

    it('should return null for non-existent variable', () => {
        const project = setupProject();
        addSourceFiles(project, [path.join(FIXTURES_DIR, 'simple-component.css.ts')]);
        const cssFile = project.getSourceFileOrThrow(
            path.join(FIXTURES_DIR, 'simple-component.css.ts'),
        );

        const defaults = parseRecipeDefaultVariants(cssFile, 'nonExistent');

        expect(defaults).toBeNull();
    });
});

describe('getDefaultValuesForNamespace', () => {
    it('should get defaults for single-component file', () => {
        const project = setupProject();
        const [sourceFile] = addSourceFiles(project, [
            path.join(FIXTURES_DIR, 'simple-component.tsx'),
            path.join(FIXTURES_DIR, 'simple-component.css.ts'),
        ]);

        const defaults = getDefaultValuesForNamespace(sourceFile, 'SimpleButton');

        expect(defaults).toEqual({ colorPalette: 'primary', size: 'md', variant: 'fill' });
    });

    it('should get different defaults for different namespaces in compound component', () => {
        const project = setupProject();
        const [sourceFile] = addSourceFiles(project, [
            path.join(FIXTURES_DIR, 'compound-component.tsx'),
            path.join(FIXTURES_DIR, 'compound-component.css.ts'),
        ]);

        const rootDefaults = getDefaultValuesForNamespace(sourceFile, 'TabsRoot');
        const listDefaults = getDefaultValuesForNamespace(sourceFile, 'TabsList');
        const buttonDefaults = getDefaultValuesForNamespace(sourceFile, 'TabsButton');
        const indicatorDefaults = getDefaultValuesForNamespace(sourceFile, 'TabsIndicator');

        expect(rootDefaults).toEqual({ orientation: 'horizontal' });
        expect(listDefaults).toEqual({ variant: 'line', orientation: 'horizontal' });
        expect(buttonDefaults).toEqual({ size: 'md', variant: 'line', orientation: 'horizontal' });
        expect(indicatorDefaults).toEqual({ orientation: 'horizontal', variant: 'line' });
    });

    it('should return empty object when no style imports exist', () => {
        const project = setupProject();
        const [sourceFile] = addSourceFiles(project, [path.join(FIXTURES_DIR, 'props-sample.tsx')]);

        const defaults = getDefaultValuesForNamespace(sourceFile, 'Simple');

        expect(defaults).toEqual({});
    });

    it('should return empty object when component does not exist', () => {
        const project = setupProject();
        const [sourceFile] = addSourceFiles(project, [
            path.join(FIXTURES_DIR, 'simple-component.tsx'),
            path.join(FIXTURES_DIR, 'simple-component.css.ts'),
        ]);

        const defaults = getDefaultValuesForNamespace(sourceFile, 'NonExistent');

        expect(defaults).toEqual({});
    });
});
