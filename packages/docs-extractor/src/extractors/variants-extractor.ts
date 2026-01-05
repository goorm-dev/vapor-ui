import fs from 'fs/promises';
import path from 'path';
import type { SourceFile } from 'ts-morph';
import { Node, SyntaxKind } from 'ts-morph';

import type { ComponentVariants, VariantInfo } from '../models';
import type { Logger } from '../utils/logger';

/**
 * Extracts vanilla-extract variants from .css.ts files
 */
export class VariantsExtractor {
    constructor(private logger: Logger) {}

    /**
     * Find the .css.ts file for a component
     */
    async findStyleFile(componentPath: string): Promise<string | null> {
        const dir = path.dirname(componentPath);
        const componentName = path.basename(componentPath, '.tsx');
        const cssFile = path.join(dir, `${componentName}.css.ts`);

        try {
            await fs.access(cssFile);
            this.logger.debug(`Found style file: ${cssFile}`);
            return cssFile;
        } catch {
            this.logger.debug(`No style file found for ${componentName}`);
            return null;
        }
    }

    /**
     * Extract variants from a recipe() call in a .css.ts file
     */
    extractVariants(sourceFile: SourceFile): ComponentVariants | null {
        this.logger.debug(`Extracting variants from ${sourceFile.getFilePath()}`);

        // Find all recipe() calls
        const recipeCall = sourceFile
            .getDescendantsOfKind(SyntaxKind.CallExpression)
            .find((call) => {
                const expr = call.getExpression();
                return expr.getText() === 'recipe';
            });

        if (!recipeCall) {
            this.logger.debug('No recipe() call found');
            return null;
        }

        const [configArg] = recipeCall.getArguments();
        if (!Node.isObjectLiteralExpression(configArg)) {
            this.logger.warn('recipe() config is not an object literal');
            return null;
        }

        // Extract variants object
        const variantsProperty = configArg.getProperty('variants');
        if (!variantsProperty || !Node.isPropertyAssignment(variantsProperty)) {
            this.logger.debug('No variants property found');
            return null;
        }

        const variantsObj = variantsProperty.getInitializer();
        if (!Node.isObjectLiteralExpression(variantsObj)) {
            this.logger.warn('variants is not an object literal');
            return null;
        }

        // Extract defaultVariants
        const defaults = new Map<string, string>();
        const defaultsProperty = configArg.getProperty('defaultVariants');

        if (defaultsProperty && Node.isPropertyAssignment(defaultsProperty)) {
            const defaultsObj = defaultsProperty.getInitializer();
            if (Node.isObjectLiteralExpression(defaultsObj)) {
                defaultsObj.getProperties().forEach((prop) => {
                    if (Node.isPropertyAssignment(prop)) {
                        const name = prop.getName();
                        const initializer = prop.getInitializer();
                        if (initializer) {
                            const value = initializer.getText().replace(/['"]/g, '');
                            defaults.set(name, value);
                        }
                    }
                });
            }
        }

        // Parse each variant
        const variants: VariantInfo[] = [];

        variantsObj.getProperties().forEach((prop) => {
            if (!Node.isPropertyAssignment(prop)) return;

            const variantName = prop.getName();
            const variantObj = prop.getInitializer();

            if (!Node.isObjectLiteralExpression(variantObj)) return;

            // Extract values (keys of the variant object)
            const type = variantObj
                .getProperties()
                .filter(Node.isPropertyAssignment)
                .map((p) => p.getName());

            // Extract JSDoc description if available
            let description: string | undefined;
            const fullText = prop.getFullText(); // Gets text including leading comments
            const jsDocRegex = /\/\*\*\s*\n?\s*\*\s*([^\n*]+)/;
            const match = fullText.match(jsDocRegex);
            if (match && match[1]) {
                description = match[1].trim();
                this.logger.debug(`Extracted description for ${variantName}: ${description}`);
            }

            this.logger.debug(`Found variant: ${variantName} with type [${type.join(', ')}]`);

            const defaultValue = defaults.get(variantName);
            variants.push({
                name: variantName,
                type,
                defaultValue,
                description,
                required: defaultValue === undefined,
            });
        });

        if (variants.length === 0) {
            return null;
        }

        return {
            sourceFile: sourceFile.getFilePath(),
            variants,
        };
    }
}
