/**
 * Export 분석 유틸리티 모듈
 */
import { type ExportedDeclarations, type SourceFile, SyntaxKind } from 'ts-morph';

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
