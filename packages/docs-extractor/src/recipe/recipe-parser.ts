/**
 * Recipe Parser - common utilities for parsing vanilla-extract recipe() calls
 *
 * This module provides shared functionality for extracting information
 * from vanilla-extract recipe() function calls in .css.ts files.
 */
import type { CallExpression, ObjectLiteralExpression, SourceFile } from 'ts-morph';
import { Node, SyntaxKind } from 'ts-morph';

import type { Logger } from '../utils/logger';

/**
 * Parsed recipe information
 */
export interface ParsedRecipe {
    /** The recipe() call expression */
    callExpression: CallExpression;
    /** The config object argument */
    configObject: ObjectLiteralExpression;
    /** Variants object if present */
    variantsObject?: ObjectLiteralExpression;
    /** Default variants object if present */
    defaultVariantsObject?: ObjectLiteralExpression;
}

/**
 * Recipe Parser class
 */
export class RecipeParser {
    constructor(private logger: Logger) {}

    /**
     * Find all recipe() calls in a source file
     */
    findRecipeCalls(sourceFile: SourceFile): CallExpression[] {
        return sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression).filter((call) => {
            const expr = call.getExpression();
            return expr.getText() === 'recipe';
        });
    }

    /**
     * Parse a recipe() call and extract its components
     */
    parseRecipeCall(recipeCall: CallExpression): ParsedRecipe | null {
        const [configArg] = recipeCall.getArguments();

        if (!Node.isObjectLiteralExpression(configArg)) {
            this.logger.warn('recipe() config is not an object literal');
            return null;
        }

        const result: ParsedRecipe = {
            callExpression: recipeCall,
            configObject: configArg,
        };

        // Extract variants property
        const variantsProperty = configArg.getProperty('variants');
        if (variantsProperty && Node.isPropertyAssignment(variantsProperty)) {
            const variantsObj = variantsProperty.getInitializer();
            if (Node.isObjectLiteralExpression(variantsObj)) {
                result.variantsObject = variantsObj;
            }
        }

        // Extract defaultVariants property
        const defaultsProperty = configArg.getProperty('defaultVariants');
        if (defaultsProperty && Node.isPropertyAssignment(defaultsProperty)) {
            const defaultsObj = defaultsProperty.getInitializer();
            if (Node.isObjectLiteralExpression(defaultsObj)) {
                result.defaultVariantsObject = defaultsObj;
            }
        }

        return result;
    }

    /**
     * Extract default values from a defaultVariants object
     */
    extractDefaultValues(defaultVariantsObj: ObjectLiteralExpression): Map<string, string> {
        const defaults = new Map<string, string>();

        defaultVariantsObj.getProperties().forEach((prop) => {
            if (Node.isPropertyAssignment(prop)) {
                const name = prop.getName();
                const initializer = prop.getInitializer();
                if (initializer) {
                    const value = initializer.getText().replace(/['"]/g, '');
                    defaults.set(name, value);
                    this.logger.debug(`Extracted default: ${name} = ${value}`);
                }
            }
        });

        return defaults;
    }

    /**
     * Extract variant keys from a variants object
     */
    extractVariantKeys(variantsObj: ObjectLiteralExpression): string[] {
        return variantsObj
            .getProperties()
            .filter(Node.isPropertyAssignment)
            .map((prop) => prop.getName());
    }

    /**
     * Extract variant values for a specific variant key
     */
    extractVariantValues(variantsObj: ObjectLiteralExpression, variantKey: string): string[] {
        const variantProp = variantsObj.getProperty(variantKey);

        if (!variantProp || !Node.isPropertyAssignment(variantProp)) {
            return [];
        }

        const variantValues = variantProp.getInitializer();

        if (!Node.isObjectLiteralExpression(variantValues)) {
            return [];
        }

        return variantValues
            .getProperties()
            .filter(Node.isPropertyAssignment)
            .map((p) => p.getName());
    }
}
