import type {
    InterfaceDeclaration,
    Project,
    PropertySignature,
    SourceFile,
    Symbol,
    Type,
    TypeAliasDeclaration,
} from 'ts-morph';
import { SyntaxKind } from 'ts-morph';

import { SprinklesTypeExtractor } from '../sprinkles/index.js';
import type { PropertyDoc } from '../types/index.js';
import type { Logger } from '../utils/logger.js';
import { ExternalTypeChecker } from './external-type-checker.js';
import { PropsFilter } from './props-filter.js';

/**
 * Resolves type information and determines if types are external
 * This is the main facade for type resolution functionality
 */
export class TypeResolver {
    private externalTypeChecker: ExternalTypeChecker;
    private propsFilter: PropsFilter;
    private sprinklesTypeExtractor: SprinklesTypeExtractor | null = null;

    constructor(
        private logger: Logger,
        private project: Project,
    ) {
        this.externalTypeChecker = new ExternalTypeChecker(logger);
        this.propsFilter = new PropsFilter(logger, project);
    }

    // ============================================
    // External Type Checking (delegated)
    // ============================================

    /**
     * Check if a type is from an external library (node_modules)
     */
    isExternalType(symbol: Symbol): boolean {
        return this.externalTypeChecker.isExternalType(symbol);
    }

    /**
     * Check if a property is defined locally (not in node_modules)
     */
    isLocalProperty(prop: PropertySignature): boolean {
        return this.externalTypeChecker.isLocalProperty(prop);
    }

    /**
     * Check if a source file is from node_modules
     */
    isExternalSourceFile(sourceFile: SourceFile): boolean {
        return this.externalTypeChecker.isExternalSourceFile(sourceFile);
    }

    /**
     * Check if a property is an HTML intrinsic element prop from @types/react
     */
    isHTMLIntrinsicProp(prop: PropertySignature): boolean {
        return this.externalTypeChecker.isHTMLIntrinsicProp(prop);
    }

    // ============================================
    // Props Filtering (delegated)
    // ============================================

    /**
     * Check if a property name is a React special prop (ref, key)
     */
    isReactSpecialProp(propName: string): boolean {
        return this.propsFilter.isReactSpecialProp(propName);
    }

    /**
     * Filter out React special props from a property list
     */
    filterReactSpecialProps(props: PropertyDoc[], includeReactProps: boolean): PropertyDoc[] {
        return this.propsFilter.filterReactSpecialProps(props, includeReactProps);
    }

    /**
     * Check if a property name is a sprinkles prop
     */
    isSprinklesProp(propName: string, projectRoot: string): boolean {
        return this.propsFilter.isSprinklesProp(propName, projectRoot);
    }

    /**
     * Filter sprinkles props based on CLI option
     */
    filterSprinklesProps(
        props: PropertyDoc[],
        stylePropsOption: string | undefined,
        projectRoot: string,
    ): PropertyDoc[] {
        return this.propsFilter.filterSprinklesProps(props, stylePropsOption, projectRoot);
    }

    // ============================================
    // Type Resolution (core functionality)
    // ============================================

    /**
     * Get original symbol for aliased imports
     * Essential for: import { Checkbox } from '@base-ui-components/react/checkbox'
     */
    getAliasedSymbol(symbol: Symbol): Symbol {
        const aliased = symbol.getAliasedSymbol();
        return aliased || symbol;
    }

    /**
     * Extract extended types from an interface
     * Example: interface Props extends BaseCheckbox.Root.Props, OtherProps
     */
    getExtendedTypes(interfaceDecl: InterfaceDeclaration): Type[] {
        return interfaceDecl.getBaseTypes();
    }

    /**
     * Get all properties from a type, including inherited ones
     */
    getAllProperties(type: Type): PropertySignature[] {
        const properties: PropertySignature[] = [];

        for (const symbol of type.getProperties()) {
            const declarations = symbol.getDeclarations();

            for (const decl of declarations) {
                if (decl && decl.isKind(SyntaxKind.PropertySignature)) {
                    properties.push(decl as PropertySignature);
                }
            }
        }

        return properties;
    }

    /**
     * Get the type of an interface or type alias
     */
    getTypeFromDeclaration(decl: InterfaceDeclaration | TypeAliasDeclaration): Type | undefined {
        try {
            return decl.getType();
        } catch (error) {
            this.logger.warn(`Failed to get type from declaration: ${error}`);
            return undefined;
        }
    }

    // ============================================
    // VComponentProps / Sprinkles (combined functionality)
    // ============================================

    /**
     * Check if an interface extends VComponentProps (which includes Sprinkles)
     * @param interfaceDecl - The interface declaration to check
     * @returns True if the interface extends VComponentProps
     */
    extendsVComponentProps(interfaceDecl: InterfaceDeclaration): boolean {
        const baseTypes = interfaceDecl.getBaseTypes();

        for (const baseType of baseTypes) {
            const baseTypeText = baseType.getText();

            // Check if this base type is VComponentProps or contains VComponentProps
            if (baseTypeText.includes('VComponentProps')) {
                this.logger.debug(`Interface extends VComponentProps: ${baseTypeText}`);
                return true;
            }

            // Check if any of the base type's symbols have VComponentProps in their declarations
            const symbols = baseType.getAliasSymbol() || baseType.getSymbol();
            if (symbols) {
                const declarations = symbols.getDeclarations();
                for (const decl of declarations) {
                    const declText = decl.getText();
                    if (declText.includes('VComponentProps')) {
                        this.logger.debug(`Interface extends VComponentProps via type alias`);
                        return true;
                    }
                }
            }
        }

        return false;
    }

    /**
     * Get or create the SprinklesTypeExtractor instance
     * @param projectRoot - Root path of the project
     * @returns Cached or new SprinklesTypeExtractor instance
     */
    private getSprinklesTypeExtractor(projectRoot: string): SprinklesTypeExtractor {
        if (!this.sprinklesTypeExtractor) {
            this.sprinklesTypeExtractor = new SprinklesTypeExtractor(
                this.logger,
                this.project,
                projectRoot,
            );
        }
        return this.sprinklesTypeExtractor;
    }

    /**
     * Create synthetic PropertyDoc objects for all sprinkles props
     * These are injected when a component extends VComponentProps
     * @param projectRoot - Root path of the project
     * @returns Array of PropertyDoc objects for all sprinkles props
     */
    createSyntheticSprinklesProps(projectRoot: string): PropertyDoc[] {
        const sprinklesProps = Array.from(this.propsFilter.getSprinklesPropsSet(projectRoot));
        const typeExtractor = this.getSprinklesTypeExtractor(projectRoot);

        this.logger.debug(
            `Creating ${sprinklesProps.length} synthetic sprinkles props with accurate types`,
        );

        return sprinklesProps.map((propName) => {
            const baseType = typeExtractor.getPropertyType(propName);
            const type = typeExtractor.getResponsiveType(baseType);

            return {
                name: propName,
                type,
                required: false,
                description: `Style utility prop for ${propName}. Supports responsive values.`,
                deprecated: false,
                tags: {},
                isExternal: false,
                isHTMLIntrinsic: false,
                isSprinklesProp: true,
                source: 'external' as const,
            };
        });
    }
}
