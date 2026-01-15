import { type ExportedDeclarations, Project, type SourceFile, SyntaxKind } from 'ts-morph';

export function createProject(tsconfigPath: string): Project {
    return new Project({ tsConfigFilePath: tsconfigPath });
}

export function addSourceFiles(project: Project, filePaths: string[]): SourceFile[] {
    return project.addSourceFilesAtPaths(filePaths);
}

export function getExportedNodes(
    sourceFile: SourceFile,
): ReadonlyMap<string, ExportedDeclarations[]> {
    return sourceFile.getExportedDeclarations();
}

export function getNamespaces(sourceFile: SourceFile): string[] {
    return sourceFile
        .getDescendantsOfKind(SyntaxKind.ModuleDeclaration)
        .filter((mod) => mod.isExported())
        .map((mod) => mod.getName());
}
