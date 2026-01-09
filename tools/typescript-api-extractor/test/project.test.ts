import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { createProject, addSourceFiles } from '~/core/project';

const FIXTURES_DIR = path.join(__dirname, 'fixtures');

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
