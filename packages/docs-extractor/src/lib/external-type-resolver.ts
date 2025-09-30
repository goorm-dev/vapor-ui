import * as fs from 'fs';
import * as path from 'path';

/**
 * Resolves external type definition files from node_modules packages
 */
export class ExternalTypeResolver {
    private projectRoot: string;

    constructor(projectRoot?: string) {
        this.projectRoot = projectRoot || path.resolve(process.cwd());
    }

    /**
     * Gets type definition files for a specific npm package
     */
    getPackageTypeFiles(packageName: string, subPaths: string[] = ['index.d.ts']): string[] {
        const typeFiles: string[] = [];
        const packagePaths = this.resolvePackagePaths(packageName);

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
     * Gets Base UI main type definition file
     * Legacy method for backward compatibility
     */
    getBaseUIMainTypeFile(): string[] {
        return this.getPackageTypeFiles('@base-ui-components/react', ['esm/index.d.ts']);
    }
    /**
     * Resolves possible package installation paths (handles PNPM, npm, yarn)
     */
    private resolvePackagePaths(packageName: string): string[] {
        const possiblePaths: string[] = [];

        // Standard node_modules path
        possiblePaths.push(path.resolve(this.projectRoot, 'node_modules', packageName));

        // PNPM path patterns

        // Yarn PnP and other patterns can be added here

        return possiblePaths.filter((p) => fs.existsSync(p));
    }
}

/**
 * Configuration for external package type resolution
 */
export interface ExternalPackageConfig {
    name: string;
    subPaths?: string[];
}
