/**
 * Path Generator - generates file paths for output files
 *
 * Handles:
 * - Converting display names to file paths
 * - Kebab-case conversion
 * - Compound component folder structure
 */
import { isCompoundBase } from '../resolver';
import { toKebabCase } from '../utils/text';

/**
 * Path information for a component output file
 */
export interface OutputPath {
    /** Directory to write the file in */
    directory: string;
    /** Filename (without path) */
    filename: string;
    /** Full relative path */
    fullPath: string;
}

/**
 * Path Generator class
 */
export class PathGenerator {
    /**
     * Generate output path from a display name (PascalCase folders and files)
     *
     * @example
     *   "Button" → { directory: "Button", filename: "Button.json" }
     *   "Checkbox.Root" → { directory: "Checkbox", filename: "Root.json" }
     *   "CheckboxRoot" → { directory: "Checkbox", filename: "Root.json" }
     */
    generatePath(displayName: string): OutputPath {
        const { folder, filename } = this.getFilePathFromDisplayName(displayName);

        return {
            directory: folder,
            filename,
            fullPath: `${folder}/${filename}`,
        };
    }

    /**
     * Generate output path using kebab-case convention
     *
     * @example
     *   "Button" → { directory: "button", filename: "button.json" }
     *   "Checkbox.Root" → { directory: "checkbox", filename: "root.json" }
     *   "NavigationMenu.Trigger" → { directory: "navigation-menu", filename: "trigger.json" }
     */
    generateKebabPath(displayName: string): OutputPath {
        const { folder, filename } = this.getFilePathFromDisplayName(displayName);

        const kebabFolder = toKebabCase(folder);
        const kebabFilename = toKebabCase(filename.replace('.json', '')) + '.json';

        return {
            directory: kebabFolder,
            filename: kebabFilename,
            fullPath: `${kebabFolder}/${kebabFilename}`,
        };
    }

    /**
     * Convert a display name to folder and filename (PascalCase)
     */
    private getFilePathFromDisplayName(displayName: string): { folder: string; filename: string } {
        // Check for dot notation (compound pattern with explicit dot)
        if (displayName.includes('.')) {
            const [componentName, ...subParts] = displayName.split('.');
            const subComponent = subParts.join('');
            return {
                folder: componentName,
                filename: `${subComponent}.json`,
            };
        }

        // Try to detect compound pattern without dots (e.g., "CheckboxRoot" → "Checkbox" + "Root")
        const compoundMatch = displayName.match(/^([A-Z][a-z]{2,})([A-Z][a-z]+(?:[A-Z][a-z]+)*)$/);
        if (compoundMatch) {
            const [, baseComponent, subComponent] = compoundMatch;

            // Only split if it's a known compound component pattern
            if (isCompoundBase(baseComponent)) {
                return {
                    folder: baseComponent,
                    filename: `${subComponent}.json`,
                };
            }
        }

        // Single component case (default) - folder and filename are the same
        return { folder: displayName, filename: `${displayName}.json` };
    }
}
