/**
 * ts-morph Project 팩토리 모듈
 */
import { Project, type SourceFile } from 'ts-morph';

export function createProject(tsconfigPath: string): Project {
    return new Project({ tsConfigFilePath: tsconfigPath });
}

export function addSourceFiles(project: Project, filePaths: string[]): SourceFile[] {
    return project.addSourceFilesAtPaths(filePaths);
}
