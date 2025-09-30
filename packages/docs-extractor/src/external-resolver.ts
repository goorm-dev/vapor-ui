import * as fs from 'fs';
import * as path from 'path';

/**
 * Gets type definition files for a specific npm package
 */
export function getPackageTypeFiles(
    projectRoot: string,
    packageName: string,
    subPaths: string[] = ['index.d.ts']
): string[] {
    const typeFiles: string[] = [];
    const packagePaths = resolvePackagePaths(projectRoot, packageName);

    for (const packagePath of packagePaths) {
        for (const subPath of subPaths) {
            const fullPath = path.join(packagePath, subPath);
            if (fs.existsSync(fullPath)) {
                typeFiles.push(fullPath);
            }
        }
    }

    return typeFiles;
}

/**
 * Resolves external type files based on configuration paths
 * Format: ['package:subpath', 'package2:subpath2']
 */
export function resolveExternalTypeFiles(
    projectRoot: string,
    externalTypePaths?: string[]
): string[] {
    const typeFiles: string[] = [];
    const typePaths = externalTypePaths || ['@base-ui-components/react:esm/index.d.ts'];

    for (const typePath of typePaths) {
        const [packageName, subPath] = typePath.split(':');
        const files = getPackageTypeFiles(projectRoot, packageName, [subPath || 'index.d.ts']);
        typeFiles.push(...files);
    }

    return typeFiles;
}

/**
 * Gets Base UI main type definition file
 * Legacy method for backward compatibility
 */
export function getBaseUIMainTypeFile(projectRoot: string): string[] {
    return getPackageTypeFiles(projectRoot, '@base-ui-components/react', ['esm/index.d.ts']);
}

/**
 * Resolves possible package installation paths (handles PNPM, npm, yarn)
 */
function resolvePackagePaths(projectRoot: string, packageName: string): string[] {
    const possiblePaths: string[] = [];

    // Standard node_modules path
    possiblePaths.push(path.resolve(projectRoot, 'node_modules', packageName));

    // PNPM path patterns
    // Yarn PnP and other patterns can be added here

    return possiblePaths.filter((p) => fs.existsSync(p));
}

/**
 * Configuration for external package type resolution
 */
export interface ExternalPackageConfig {
    name: string;
    subPaths?: string[];
}