import fs from 'fs/promises';
import path from 'path';

import { isCompoundBase } from '../resolver';
import type { ComponentExport, ExtractorOutput } from '../types';
import type { Logger } from '../utils/logger';
import { PathGenerator } from './path-generator';

/**
 * Output format for ComponentPropsTable compatibility
 */
interface ComponentPropsTableOutput {
    name: string;
    displayName: string;
    description: string;
    props: Array<{
        name: string;
        type: string[];
        required: boolean;
        description: string;
        defaultValue?: string;
    }>;
    variants?: Array<{
        name: string;
        type: string[];
        required: boolean;
        defaultValue?: string;
        description?: string;
    }>;
}

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
     * Creates structure like: outputDir/button/button.json, outputDir/dialog/root.json
     * Uses kebab-case for folder and file names (as per STRUCTURE.md)
     */
    async writeComponentFiles(output: ExtractorOutput, outputDir: string): Promise<void> {
        this.logger.debug(`Writing component files to ${outputDir}`);

        // Create the output directory if it doesn't exist
        await fs.mkdir(outputDir, { recursive: true });

        const pathGenerator = new PathGenerator();
        let filesWritten = 0;

        for (const component of output.components) {
            for (const exportData of component.exports) {
                // Get folder and filename from display name (kebab-case)
                const { directory, filename } = pathGenerator.generateKebabPath(
                    exportData.displayName,
                );

                // Create component directory
                const componentDir = path.join(outputDir, directory);
                await fs.mkdir(componentDir, { recursive: true });

                // Convert to ComponentPropsTable format
                const propsTableOutput = this.convertToPropsTableFormat(
                    exportData,
                    component.description,
                );

                // Write the component file
                const filePath = path.join(componentDir, filename);
                const json = JSON.stringify(propsTableOutput, null, 2);
                await fs.writeFile(filePath, json, 'utf-8');

                this.logger.debug(`Wrote ${filePath}`);
                filesWritten++;
            }
        }

        this.logger.success(`Documentation written to ${outputDir} (${filesWritten} files)`);
    }

    /**
     * Convert a display name to a file path structure (PascalCase)
     * Examples:
     *   "Button" → {folder: "Button", filename: "Button.json"}
     *   "IconButton" → {folder: "IconButton", filename: "IconButton.json"}
     *   "Checkbox.Root" → {folder: "Checkbox", filename: "Root.json"}
     *   "CheckboxRoot" → {folder: "Checkbox", filename: "Root.json"}
     *   "CheckboxIndicatorPrimitive" → {folder: "Checkbox", filename: "IndicatorPrimitive.json"}
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
        // Match pattern: ComponentNameSubComponent where both parts start with capital letter
        // Only treat as compound if base component is in the whitelist
        const compoundMatch = displayName.match(/^([A-Z][a-z]{2,})([A-Z][a-z]+(?:[A-Z][a-z]+)*)$/);
        if (compoundMatch) {
            const [, baseComponent, subComponent] = compoundMatch;

            // Only split if it's a known compound component pattern
            if (this.isCompoundPattern(baseComponent)) {
                return {
                    folder: baseComponent,
                    filename: `${subComponent}.json`,
                };
            }
        }

        // Single component case (default) - folder and filename are the same
        return { folder: displayName, filename: `${displayName}.json` };
    }

    /**
     * Check if a component base name is a known compound component pattern
     * Compound components are those that have sub-components like Checkbox.Root, Dialog.Content, etc.
     * See: src/resolver/compound-config.ts for the shared list
     */
    private isCompoundPattern(baseComponent: string): boolean {
        return isCompoundBase(baseComponent);
    }

    /**
     * Convert ComponentExport to ComponentPropsTable format
     * - Converts type to always be an array
     * - Adds generatedAt and sourceFile fields
     */
    private convertToPropsTableFormat(
        exportData: ComponentExport,
        componentDescription?: string,
    ): ComponentPropsTableOutput {
        // Get description from export or component level
        const description = this.getExportDescription(exportData) || componentDescription || '';

        // Get variant names to exclude from props (variants have their own field with defaultValue)
        const variantNames = new Set(exportData.variants?.variants.map((v) => v.name) ?? []);

        // Filter out variant props and convert to the expected format
        const props = exportData.props
            .filter((prop) => !variantNames.has(prop.name))
            .map((prop) => {
                // Determine type array: use values if available, otherwise parse type string
                let typeArray: string[];

                if (prop.values && prop.values.length > 0) {
                    // Use parsed union values if available
                    typeArray = prop.values;
                } else if (prop.type) {
                    // Parse type string - handle union types and wrap single types
                    typeArray = this.parseTypeToArray(prop.type);
                } else {
                    typeArray = ['unknown'];
                }

                return {
                    name: prop.name,
                    type: typeArray,
                    required: prop.required,
                    description: prop.description || '',
                    ...(prop.defaultValue !== undefined && { defaultValue: prop.defaultValue }),
                };
            });

        return {
            name: this.getExportShortName(exportData.displayName),
            displayName: exportData.displayName,
            description,
            props,
            ...(exportData.variants && {
                variants: exportData.variants.variants.map((v) => ({
                    name: v.name,
                    type: v.values,
                    required: v.required,
                    ...(v.defaultValue !== undefined && { defaultValue: v.defaultValue }),
                    ...(v.description && { description: v.description }),
                })),
            }),
        };
    }

    /**
     * Get description from export data
     * Returns the JSDoc description of the component
     */
    private getExportDescription(exportData: ComponentExport): string | undefined {
        return exportData.description;
    }

    /**
     * Get the short name from display name (last part after dot)
     * Examples: "Dialog.Root" → "Root", "Button" → "Button"
     */
    private getExportShortName(displayName: string): string {
        if (displayName.includes('.')) {
            const parts = displayName.split('.');
            return parts[parts.length - 1];
        }
        return displayName;
    }

    /**
     * Parse a type string into an array of type values
     * Handles union types like "string | number" → ["string", "number"]
     */
    private parseTypeToArray(typeStr: string): string[] {
        // Handle union types - split by | and trim
        if (typeStr.includes('|')) {
            return typeStr
                .split('|')
                .map((t) => t.trim())
                .filter((t) => t.length > 0)
                .map((t) => this.cleanTypeValue(t));
        }

        // Single type - return as array
        return [this.cleanTypeValue(typeStr)];
    }

    /**
     * Clean a type value - remove quotes from string literals
     * Examples: '"primary"' → 'primary', 'string' → 'string'
     */
    private cleanTypeValue(value: string): string {
        // Remove surrounding quotes from string literals
        const trimmed = value.trim();
        if (
            (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
            (trimmed.startsWith("'") && trimmed.endsWith("'"))
        ) {
            return trimmed.slice(1, -1);
        }
        return trimmed;
    }
}
