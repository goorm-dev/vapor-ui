import type { ExtractorOutput, ComponentExport, MergedPropertyDoc } from '../types/index.js';
import type { Logger } from '../utils/logger.js';
import fs from 'fs/promises';
import path from 'path';

/**
 * Renders the extracted documentation as JSON
 */
export class JsonRenderer {
    constructor(private logger: Logger) {}

    /**
     * Render the output as a JSON string
     */
    render(output: ExtractorOutput): string {
        this.logger.debug('Rendering output as JSON');
        return JSON.stringify(output, null, 2);
    }

    /**
     * Write the JSON output to a file
     */
    async writeToFile(output: ExtractorOutput, filePath: string): Promise<void> {
        this.logger.debug(`Writing output to ${filePath}`);
        const json = this.render(output);
        await fs.writeFile(filePath, json, 'utf-8');
        this.logger.success(`Documentation written to ${filePath}`);
    }

    /**
     * Write component files to individual JSON files organized by folder
     * Creates structure like: outputDir/button/button.json, outputDir/checkbox/root.json
     */
    async writeComponentFiles(output: ExtractorOutput, outputDir: string): Promise<void> {
        this.logger.debug(`Writing component files to ${outputDir}`);

        // Create the output directory if it doesn't exist
        await fs.mkdir(outputDir, { recursive: true });

        let filesWritten = 0;

        for (const component of output.components) {
            for (const exportData of component.exports) {
                // Remove source file paths from the export
                const cleanedExport = this.stripSourceFilePaths(exportData);

                // Get folder and filename from display name
                const { folder, filename } = this.getFilePathFromDisplayName(exportData.displayName);

                // Create component directory
                const componentDir = path.join(outputDir, folder);
                await fs.mkdir(componentDir, { recursive: true });

                // Write the component file
                const filePath = path.join(componentDir, filename);
                const json = this.renderComponentExport(cleanedExport);
                await fs.writeFile(filePath, json, 'utf-8');

                this.logger.debug(`Wrote ${filePath}`);
                filesWritten++;
            }
        }

        this.logger.success(`Documentation written to ${outputDir} (${filesWritten} files)`);
    }

    /**
     * Convert a display name to a file path structure
     * Examples:
     *   "Button" → {folder: "button", filename: "button.json"}
     *   "IconButton" → {folder: "icon-button", filename: "icon-button.json"}
     *   "Checkbox.Root" → {folder: "checkbox", filename: "root.json"}
     *   "CheckboxRoot" → {folder: "checkbox", filename: "root.json"}
     *   "CheckboxIndicatorPrimitive" → {folder: "checkbox", filename: "indicator-primitive.json"}
     */
    private getFilePathFromDisplayName(displayName: string): { folder: string; filename: string } {
        // Check for dot notation (compound pattern with explicit dot)
        if (displayName.includes('.')) {
            const [componentName, ...subParts] = displayName.split('.');
            const subComponent = subParts.join('-');
            return {
                folder: this.toKebabCase(componentName),
                filename: `${this.toKebabCase(subComponent)}.json`,
            };
        }

        // Try to detect compound pattern without dots (e.g., "CheckboxRoot" → "Checkbox" + "Root")
        // Match pattern: ComponentNameSubComponent where both parts start with capital letter
        // Only treat as compound if base component is in the whitelist
        const compoundMatch = displayName.match(/^([A-Z][a-z]{2,})([A-Z][a-z]+(?:[A-Z][a-z]+)*)$/);
        if (compoundMatch) {
            const [, baseComponent, subComponent] = compoundMatch;

            // Only split if it's a known compound component pattern
            if (this.isCompoundPattern(baseComponent)) {
                return {
                    folder: this.toKebabCase(baseComponent),
                    filename: `${this.toKebabCase(subComponent)}.json`,
                };
            }
        }

        // Single component case (default)
        const kebab = this.toKebabCase(displayName);
        return { folder: kebab, filename: `${kebab}.json` };
    }

    /**
     * Check if a component base name is a known compound component pattern
     * Compound components are those that have sub-components like Checkbox.Root, Dialog.Content, etc.
     */
    private isCompoundPattern(baseComponent: string): boolean {
        // Known compound component base names
        const compoundBases = ['Checkbox', 'Radio', 'Dialog', 'Popover', 'Menu', 'Select', 'Tabs'];
        return compoundBases.includes(baseComponent);
    }

    /**
     * Convert PascalCase to kebab-case
     * Examples: "Button" → "button", "CheckboxRoot" → "checkbox-root"
     */
    private toKebabCase(str: string): string {
        return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    }

    /**
     * Remove source file paths and unnecessary nested docs from the export data
     * This prevents absolute paths from being exposed in the JSON output
     */
    private stripSourceFilePaths(exportData: ComponentExport): ComponentExport {
        return {
            ...exportData,
            // Remove sourceFile, localDoc, and externalDoc from props
            props: exportData.props.map((prop) => {
                const { sourceFile, localDoc, externalDoc, ...rest } = prop;
                return rest as MergedPropertyDoc;
            }),
            // Remove sourceFile from variants if present
            variants: exportData.variants
                ? {
                      sourceFile: '', // Empty string to satisfy type requirement
                      variants: exportData.variants.variants,
                  }
                : undefined,
        };
    }

    /**
     * Render a single component export as JSON
     * This renders just the component data without the metadata wrapper
     */
    private renderComponentExport(exportData: ComponentExport): string {
        return JSON.stringify(exportData, null, 2);
    }
}
