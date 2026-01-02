/**
 * Type Analyzer - analyzes TypeScript types and inheritance
 *
 * Provides utilities for:
 * - Tracing type inheritance chains
 * - Resolving generic types
 * - Analyzing interface extensions
 */
import type {
    InterfaceDeclaration,
    Symbol as TsSymbol,
    Type,
    TypeAliasDeclaration,
} from 'ts-morph';

import type { Logger } from '../utils/logger';

/**
 * Information about a type's inheritance
 */
export interface TypeInheritance {
    /** The type itself */
    type: Type;
    /** Base types that this type extends */
    baseTypes: Type[];
    /** Property symbols from this type */
    ownProperties: TsSymbol[];
    /** All properties including inherited */
    allProperties: TsSymbol[];
}

/**
 * Type Analyzer class
 */
export class TypeAnalyzer {
    constructor(private logger: Logger) {}

    /**
     * Analyze a type's inheritance chain
     */
    analyzeInheritance(type: Type): TypeInheritance {
        const baseTypes = type.getBaseTypes();
        const ownProperties = this.getOwnProperties(type);
        const allProperties = type.getProperties();

        this.logger.debug(
            `Analyzed type with ${baseTypes.length} base types, ${ownProperties.length} own props, ${allProperties.length} total props`,
        );

        return {
            type,
            baseTypes,
            ownProperties,
            allProperties,
        };
    }

    /**
     * Get only the properties declared directly on this type (not inherited)
     */
    getOwnProperties(type: Type): TsSymbol[] {
        const allProperties = type.getProperties();
        const baseProperties = new Set<string>();

        // Collect all base type property names
        for (const baseType of type.getBaseTypes()) {
            for (const prop of baseType.getProperties()) {
                baseProperties.add(prop.getName());
            }
        }

        // Filter to only own properties
        return allProperties.filter((prop) => !baseProperties.has(prop.getName()));
    }

    /**
     * Flatten a type to get all properties from the type and its intersections
     */
    flattenType(type: Type): TsSymbol[] {
        const properties: TsSymbol[] = [];

        if (type.isIntersection()) {
            // For intersection types, collect properties from all constituent types
            for (const constituentType of type.getIntersectionTypes()) {
                properties.push(...constituentType.getProperties());
            }
        } else {
            properties.push(...type.getProperties());
        }

        // Remove duplicates by name (later entries override earlier ones)
        const uniqueProps = new Map<string, TsSymbol>();
        for (const prop of properties) {
            uniqueProps.set(prop.getName(), prop);
        }

        return Array.from(uniqueProps.values());
    }

    /**
     * Get the declaration file path for a type
     */
    getTypeDeclarationPath(type: Type): string | undefined {
        const symbol = type.getSymbol();
        if (!symbol) {
            return undefined;
        }

        const declarations = symbol.getDeclarations();
        if (declarations.length === 0) {
            return undefined;
        }

        return declarations[0].getSourceFile().getFilePath();
    }

    /**
     * Check if a type is from an external library (node_modules)
     */
    isExternalType(type: Type): boolean {
        const path = this.getTypeDeclarationPath(type);
        return path ? path.includes('node_modules') : false;
    }

    /**
     * Analyze an interface declaration
     */
    analyzeInterface(interfaceDecl: InterfaceDeclaration): {
        name: string;
        extends: string[];
        properties: string[];
    } {
        const name = interfaceDecl.getName();
        const extendsTypes = interfaceDecl.getExtends().map((e) => e.getText());
        const properties = interfaceDecl.getProperties().map((p) => p.getName());

        return {
            name,
            extends: extendsTypes,
            properties,
        };
    }

    /**
     * Analyze a type alias declaration
     */
    analyzeTypeAlias(typeAlias: TypeAliasDeclaration): {
        name: string;
        type: string;
        isIntersection: boolean;
        isUnion: boolean;
    } {
        const name = typeAlias.getName();
        const type = typeAlias.getType();
        const typeText = type.getText();

        return {
            name,
            type: typeText,
            isIntersection: type.isIntersection(),
            isUnion: type.isUnion(),
        };
    }
}
