import { globby } from 'globby';
import path from 'path';

import type { ComponentMetadata } from '../types';
import type { Logger } from '../utils/logger';

/**
 * Scans the codebase to find component files
 */
export class ComponentScanner {
    constructor(private logger: Logger) {}

    /**
     * Scan for component files in the given directory
     */
    async scanComponents(
        corePackagePath: string,
        componentName?: string,
    ): Promise<ComponentMetadata[]> {
        let pattern: string;

        if (componentName) {
            // Scan specific component
            const lowerCaseName = componentName.toLowerCase();
            pattern = path.join(
                corePackagePath,
                `src/components/${lowerCaseName}/${lowerCaseName}.tsx`,
            );
            this.logger.debug(`Scanning for specific component: ${componentName}`);
        } else {
            // Scan all components
            pattern = path.join(corePackagePath, 'src/components/**/*.tsx');
            this.logger.debug(`Scanning all components in ${corePackagePath}`);
        }

        const files = await globby(pattern, {
            ignore: ['**/*.test.tsx', '**/*.stories.tsx'],
            absolute: true,
        });

        this.logger.debug(`Found ${files.length} component files`);

        const components: ComponentMetadata[] = [];

        for (const file of files) {
            const metadata = this.analyzeComponentFile(file);
            if (metadata) {
                components.push(metadata);
            }
        }

        return components;
    }

    /**
     * Analyze a component file to extract metadata
     */
    private analyzeComponentFile(filePath: string): ComponentMetadata | null {
        const basename = path.basename(filePath, '.tsx');
        const dirName = path.basename(path.dirname(filePath));

        // Simple heuristic: if filename matches directory name, it's likely a main component file
        if (basename !== dirName) {
            this.logger.debug(`Skipping ${filePath} (filename doesn't match directory)`);
            return null;
        }

        // Capitalize first letter for display name
        const displayName = basename.charAt(0).toUpperCase() + basename.slice(1);

        return {
            name: displayName,
            displayName: displayName,
            filePath,
            exportType: 'named',
            hasNamespace: false, // Will be determined during extraction
        };
    }
}
