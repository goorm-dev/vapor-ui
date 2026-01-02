import path from 'path';
import type { Project, SourceFile, Type } from 'ts-morph';

import type { Logger } from '../utils/logger';

/**
 * Extracts actual CSS values from the Sprinkles type that rainbow-sprinkles generates
 * instead of using hardcoded values
 */
export class SprinklesTypeIntrospector {
    private sprinklesType: Type | null = null;
    private propertyTypeCache: Map<string, string[]> = new Map();
    private extractionAttempted: boolean = false;

    constructor(
        private logger: Logger,
        private project: Project,
        private projectRoot: string,
    ) {}

    /**
     * Get CSS values for a specific property by extracting from the Sprinkles type
     * @param propName - Property name (e.g., 'position', 'display')
     * @returns Array of CSS values or null if extraction fails
     */
    getCssValuesForProperty(propName: string): string[] | null {
        this.logger.debug(`[Introspector] Getting CSS values for property: ${propName}`);

        // Check cache first
        if (this.propertyTypeCache.has(propName)) {
            this.logger.debug(`[Introspector] Using cached values for ${propName}`);
            return this.propertyTypeCache.get(propName)!;
        }

        // Ensure Sprinkles type is loaded
        if (!this.ensureSprinklesTypeLoaded()) {
            this.logger.warn(`[Introspector] Failed to load Sprinkles type for ${propName}`);
            return null;
        }

        try {
            // Get property type from Sprinkles
            const propertyType = this.extractPropertyType(propName);
            if (!propertyType) {
                this.logger.warn(`[Introspector] Could not find property type for ${propName}`);
                return null;
            }

            this.logger.debug(
                `[Introspector] Found property type for ${propName}: ${propertyType.getText().substring(0, 200)}`,
            );

            // Unwrap conditional/responsive types
            const unwrappedType = this.unwrapConditionalTypes(propertyType);
            this.logger.debug(
                `[Introspector] Unwrapped type for ${propName}: ${unwrappedType.getText().substring(0, 200)}`,
            );

            // Extract string literals from union
            const values = this.extractStringLiteralsFromUnion(unwrappedType);

            if (values.length === 0) {
                this.logger.warn(`[Introspector] No string literal values found for ${propName}`);
                return null;
            }

            // Cache and return
            this.propertyTypeCache.set(propName, values);
            this.logger.info(
                `[Introspector] ✓ Extracted ${values.length} CSS values for ${propName}: ${values.slice(0, 10).join(', ')}`,
            );
            return values;
        } catch (error) {
            this.logger.warn(
                `[Introspector] Error extracting CSS values for ${propName}: ${error}`,
            );
            return null;
        }
    }

    /**
     * Load the Sprinkles type alias from sprinkles.css.ts
     * @returns true if successful, false otherwise
     */
    private ensureSprinklesTypeLoaded(): boolean {
        if (this.sprinklesType) {
            return true;
        }

        if (this.extractionAttempted) {
            return false; // Don't retry if we already failed
        }

        this.extractionAttempted = true;

        try {
            const sprinklesPath = path.join(this.projectRoot, 'src/styles/sprinkles.css.ts');
            this.logger.debug(`Loading Sprinkles type from: ${sprinklesPath}`);

            let sourceFile: SourceFile | undefined;
            try {
                sourceFile = this.project.getSourceFile(sprinklesPath);
                if (!sourceFile) {
                    sourceFile = this.project.addSourceFileAtPath(sprinklesPath);
                }
            } catch (error) {
                this.logger.warn(`Failed to load sprinkles.css.ts: ${error}`);
                return false;
            }

            // Find the Sprinkles type alias
            const sprinklesTypeAlias = sourceFile.getTypeAlias('Sprinkles');
            if (!sprinklesTypeAlias) {
                this.logger.warn('Could not find Sprinkles type alias in sprinkles.css.ts');
                return false;
            }

            // Get the type
            this.sprinklesType = sprinklesTypeAlias.getType();
            this.logger.debug('Successfully loaded Sprinkles type');
            return true;
        } catch (error) {
            this.logger.warn(`Error loading Sprinkles type: ${error}`);
            return false;
        }
    }

    /**
     * Extract the Type for a specific property from the Sprinkles type
     * @param propName - Property name
     * @returns Type object or null
     */
    private extractPropertyType(propName: string): Type | null {
        if (!this.sprinklesType) {
            return null;
        }

        try {
            // Get the property symbol from the Sprinkles type
            const properties = this.sprinklesType.getProperties();
            const propSymbol = properties.find((p) => p.getName() === propName);

            if (!propSymbol) {
                this.logger.debug(`Property ${propName} not found in Sprinkles type`);
                return null;
            }

            // Get the type of this property from the Sprinkles type itself
            // This properly resolves conditional types
            const propType = propSymbol.getTypeAtLocation(propSymbol.getDeclarations()[0]);
            return propType;
        } catch (error) {
            this.logger.warn(`Error extracting property type for ${propName}: ${error}`);
            return null;
        }
    }

    /**
     * Unwrap conditional and responsive type wrappers to get to the base union type
     * Removes: undefined, null, (string & {}), responsive objects
     * Returns a union of all non-wrapper types
     * @param type - Type to unwrap
     * @returns Unwrapped type (possibly a union)
     */
    private unwrapConditionalTypes(type: Type): Type {
        // If it's not a union, just return it
        if (!type.isUnion()) {
            return type;
        }

        const unionTypes = type.getUnionTypes();
        const nonWrapperTypes: Type[] = [];

        for (const unionType of unionTypes) {
            // Skip undefined/null
            if (unionType.isUndefined() || unionType.isNull()) {
                continue;
            }

            // Skip string escape hatch: (string & {})
            const typeText = unionType.getText();
            if (
                typeText.includes('string & {}') ||
                typeText.includes('string & Record<never, never>')
            ) {
                continue;
            }

            // Skip object types (responsive wrapper objects)
            if (unionType.isObject() && !unionType.isLiteral()) {
                // Check if it's a responsive object like { mobile?: T, tablet?: T }
                const props = unionType.getProperties();
                const propNames = props.map((p) => p.getName());
                if (
                    propNames.includes('mobile') ||
                    propNames.includes('tablet') ||
                    propNames.includes('desktop')
                ) {
                    continue; // Skip responsive wrapper
                }

                // If it's a generic object type that's not a responsive wrapper,
                // it might be a complex type reference - skip it
                if (typeText.includes('import(')) {
                    continue;
                }
            }

            // If this union member is itself a union, recursively unwrap it
            if (unionType.isUnion()) {
                const unwrapped = this.unwrapConditionalTypes(unionType);
                if (unwrapped.isUnion()) {
                    // Add all members of the nested union
                    nonWrapperTypes.push(...unwrapped.getUnionTypes());
                } else {
                    nonWrapperTypes.push(unwrapped);
                }
            } else {
                nonWrapperTypes.push(unionType);
            }
        }

        // Return a union of all non-wrapper types
        // Note: We keep the union intact rather than returning just one member
        if (nonWrapperTypes.length === 0) {
            return type; // Fallback to original type
        } else if (nonWrapperTypes.length === 1) {
            return nonWrapperTypes[0];
        } else {
            // Return as union - ts-morph doesn't have a direct way to create unions,
            // but since these are members of an existing union, we can use the first one
            // and iterate through all for extraction
            return type; // Return original union, will be handled by extractStringLiteralsFromUnion
        }
    }

    /**
     * Extract all string literal values from a union type
     * @param type - Type to extract from
     * @returns Array of string literal values
     */
    private extractStringLiteralsFromUnion(type: Type): string[] {
        const literals: string[] = [];

        // Get all types (either union members or just the single type)
        const types = type.isUnion() ? type.getUnionTypes() : [type];

        for (const t of types) {
            if (t.isStringLiteral()) {
                const literalValue = t.getLiteralValue();
                if (typeof literalValue === 'string') {
                    literals.push(literalValue);
                }
            }
        }

        // Remove duplicates and filter out unwanted values
        const uniqueLiterals = [...new Set(literals)];

        // Filter out common type system values that aren't actual CSS values
        const filtered = uniqueLiterals.filter((value) => {
            // Keep most values, but filter out obvious non-CSS patterns
            return value.length > 0 && !value.includes('Globals');
        });

        return filtered;
    }
}
