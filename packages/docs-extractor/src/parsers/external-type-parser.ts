import * as fs from 'fs';
import * as path from 'path';

/**
 * External type parsing utilities
 * Handles resolution of external type definition files
 */

/**
 * Resolves external type files from package specifications
 */
export function resolveExternalTypeFiles(
    rootDirectory: string,
    externalTypePaths: string[] = [],
): string[] {
    const resolvedFiles: string[] = [];

    for (const externalTypePath of externalTypePaths) {
        const [packageName, subPath] = externalTypePath.split(':');

        try {
            const packageJsonPath = path.resolve(rootDirectory, `${packageName}/package.json`);
            const packageDir = path.dirname(packageJsonPath);
            const fullPath = path.resolve(packageDir, subPath);

            if (fs.existsSync(fullPath)) {
                resolvedFiles.push(fullPath);
            }
        } catch (error) {
            console.warn(`Could not resolve external type path: ${externalTypePath} - ${error}`);
        }
    }

    return resolvedFiles;
}

/**
 * Checks if a prop declaration comes from Base UI components
 */
export function isBaseUIDeclaration(declarationFileName: string): boolean {
    return (
        declarationFileName.includes('node_modules/@base-ui-components/react/esm') &&
        declarationFileName.endsWith('.d.ts')
    );
}

/**
 * Checks if a prop declaration comes from project type definitions
 */
export function isProjectTypeDeclaration(declarationFileName: string): boolean {
    return (
        declarationFileName.includes('packages/core/src') &&
        (declarationFileName.endsWith('.ts') || declarationFileName.endsWith('.tsx'))
    );
}

/**
 * Determines if an external prop should be included based on source
 */
export function shouldIncludeExternalProp(
    declarationFileName: string,
    currentSourceFileName: string,
): boolean {
    // 1. Component file itself (current source file)
    if (declarationFileName === currentSourceFileName) {
        return true;
    }

    // 2. Base UI component d.ts files
    if (isBaseUIDeclaration(declarationFileName)) {
        return true;
    }

    // 3. Project's own type definition files
    if (isProjectTypeDeclaration(declarationFileName)) {
        return true;
    }

    return false;
}
