/**
 * Component metadata parser module
 *
 * Extracts JSDoc descriptions and default HTML elements from components.
 */
import type { SourceFile } from 'ts-morph';

function findComponentVariableStatement(sourceFile: SourceFile, namespaceName: string) {
    return sourceFile
        .getVariableStatements()
        .find((statement) =>
            statement.getDeclarations().some((d) => d.getName() === namespaceName),
        );
}

export function getComponentDescription(
    sourceFile: SourceFile,
    namespaceName: string,
): string | undefined {
    const variableStatement = findComponentVariableStatement(sourceFile, namespaceName);
    if (!variableStatement) return undefined;

    const jsDocs = variableStatement.getJsDocs();
    if (jsDocs.length === 0) return undefined;

    // Use the last JSDoc comment (closest to the declaration)
    return jsDocs.at(-1)!.getDescription().trim() || undefined;
}
