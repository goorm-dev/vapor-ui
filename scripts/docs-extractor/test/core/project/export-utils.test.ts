import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { getExportedNodes, getNamespaces } from '~/core/project/export-utils';
import { addSourceFiles, createProject } from '~/core/project/factory';

const FIXTURES_DIR = path.join(__dirname, '../../fixtures');

describe('createProject', () => {
    it('should create a ts-morph Project with tsconfig', () => {
        const tsconfigPath = path.join(FIXTURES_DIR, 'tsconfig.json');
        const project = createProject(tsconfigPath);

        expect(project).toBeDefined();
        expect(project.getSourceFiles).toBeDefined();
    });
});

describe('addSourceFiles', () => {
    it('should add files to project and return SourceFiles', () => {
        const tsconfigPath = path.join(FIXTURES_DIR, 'tsconfig.json');
        const project = createProject(tsconfigPath);
        const filePaths = [path.join(FIXTURES_DIR, 'sample.tsx')];

        const sourceFiles = addSourceFiles(project, filePaths);

        expect(sourceFiles).toHaveLength(1);
        expect(sourceFiles[0].getFilePath()).toContain('sample.tsx');
    });
});

describe('getExportedNodes', () => {
    it('should return exported declarations from SourceFile', () => {
        const tsconfigPath = path.join(FIXTURES_DIR, 'tsconfig.json');
        const project = createProject(tsconfigPath);
        const [sourceFile] = addSourceFiles(project, [path.join(FIXTURES_DIR, 'sample.tsx')]);

        const exported = getExportedNodes(sourceFile);

        expect(exported.has('SampleComponent')).toBe(true);
    });
});

describe('getNamespaces', () => {
    it('should return namespace names from SourceFile', () => {
        const tsconfigPath = path.join(FIXTURES_DIR, 'tsconfig.json');
        const project = createProject(tsconfigPath);
        const [sourceFile] = addSourceFiles(project, [
            path.join(FIXTURES_DIR, 'component-with-namespace.tsx'),
        ]);

        const namespaces = getNamespaces(sourceFile);

        expect(namespaces).toContain('Button');
        expect(namespaces).toContain('Input');
        expect(namespaces).toHaveLength(2);
    });
});
