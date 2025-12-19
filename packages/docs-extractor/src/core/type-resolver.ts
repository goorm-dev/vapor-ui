import type {
    Symbol,
    Type,
    InterfaceDeclaration,
    PropertySignature,
    TypeAliasDeclaration,
    SourceFile,
    Project} from 'ts-morph';
import {
    SyntaxKind
} from 'ts-morph';
import path from 'path';
import type { Logger } from '../utils/logger.js';
import type { PropertyDoc } from '../types/index.js';

/**
 * Extracts accurate type information for sprinkles props
 */
class SprinklesTypeExtractor {
    private tokenCache: Map<string, string[]> = new Map();
    private configCache: Map<string, 'token' | 'freeform' | 'shorthand'> | null = null;
    private tokenTypeMap: Map<string, string> | null = null;

    // CSS values for free-form properties
    private readonly CSS_VALUES: Record<string, string[]> = {
        position: ['static', 'relative', 'absolute', 'fixed', 'sticky'],
        display: ['none', 'block', 'inline', 'inline-block', 'flex', 'inline-flex', 'grid', 'inline-grid', 'contents'],
        alignItems: ['normal', 'stretch', 'center', 'start', 'end', 'flex-start', 'flex-end', 'baseline'],
        justifyContent: ['normal', 'flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'space-evenly', 'start', 'end'],
        flexDirection: ['row', 'row-reverse', 'column', 'column-reverse'],
        alignContent: ['normal', 'flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'space-evenly', 'stretch', 'baseline'],
        border: ['none', '0'],
        opacity: ['0', '0.25', '0.5', '0.75', '1'],
        pointerEvents: ['auto', 'none', 'all'],
        overflow: ['visible', 'hidden', 'scroll', 'auto'],
        textAlign: ['left', 'center', 'right', 'justify', 'start', 'end'],
    };

    constructor(
        private logger: Logger,
        private project: Project,
        private projectRoot: string,
    ) {}

    /**
     * Get the type string for a specific property
     */
    getPropertyType(propName: string): string {
        const config = this.getPropertyConfig(propName);

        switch (config) {
            case 'freeform':
                return this.generateFreeformType(propName);
            case 'token':
                return this.generateTokenType(propName);
            case 'shorthand':
                // Shorthands use the same token type as their base properties
                return this.generateShorthandType(propName);
            default:
                // Fallback to generic type
                return 'string | number | (string & {}) | (number & {}) | undefined';
        }
    }

    /**
     * Wrap a base type with responsive breakpoints
     */
    getResponsiveType(baseType: string): string {
        // Remove undefined from base type for responsive object
        const baseTypeWithoutUndefined = baseType.replace(' | undefined', '');

        return `${baseType} | { mobile?: ${baseTypeWithoutUndefined}; tablet?: ${baseTypeWithoutUndefined}; desktop?: ${baseTypeWithoutUndefined} }`;
    }

    /**
     * Parse sprinkles config to understand property configurations
     */
    private getPropertyConfig(propName: string): 'token' | 'freeform' | 'shorthand' {
        if (!this.configCache || !this.tokenTypeMap) {
            this.parseSprinklesConfig();
        }

        return this.configCache!.get(propName) || 'freeform';
    }

    /**
     * Get the token type (spaceTokens, dimensionTokens, etc.) for a property
     */
    private getTokenType(propName: string): string | null {
        if (!this.tokenTypeMap) {
            this.parseSprinklesConfig();
        }

        return this.tokenTypeMap!.get(propName) || null;
    }

    /**
     * Parse sprinkles.css.ts to extract property configurations
     */
    private parseSprinklesConfig(): void {
        this.configCache = new Map();
        this.tokenTypeMap = new Map();

        try {
            const sprinklesPath = path.join(this.projectRoot, 'src/styles/sprinkles.css.ts');
            this.logger.debug(`Parsing sprinkles config from: ${sprinklesPath}`);

            let sourceFile: SourceFile | undefined;
            try {
                sourceFile = this.project.getSourceFile(sprinklesPath);
                if (!sourceFile) {
                    sourceFile = this.project.addSourceFileAtPath(sprinklesPath);
                }
            } catch (error) {
                this.logger.warn(`Failed to load sprinkles.css.ts: ${error}`);
                return;
            }

            // Find the defineProperties call
            const callExpressions = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression);
            const definePropsCall = callExpressions.find((call) => {
                const expr = call.getExpression();
                return expr.getText() === 'defineProperties';
            });

            if (!definePropsCall) {
                this.logger.warn('Could not find defineProperties call in sprinkles.css.ts');
                return;
            }

            // Get the argument (config object)
            const args = definePropsCall.getArguments();
            if (args.length === 0) {
                this.logger.warn('defineProperties has no arguments');
                return;
            }

            const configObj = args[0];
            if (configObj.getKind() !== SyntaxKind.ObjectLiteralExpression) {
                this.logger.warn('defineProperties argument is not an object');
                return;
            }

            // Find dynamicProperties
            const dynamicPropsProperty = configObj
                .asKindOrThrow(SyntaxKind.ObjectLiteralExpression)
                .getProperty('dynamicProperties');

            if (dynamicPropsProperty && dynamicPropsProperty.getKind() === SyntaxKind.PropertyAssignment) {
                const dynamicPropsObj = dynamicPropsProperty
                    .asKind(SyntaxKind.PropertyAssignment)!
                    .getInitializer();

                if (dynamicPropsObj && dynamicPropsObj.getKind() === SyntaxKind.ObjectLiteralExpression) {
                    const propsObj = dynamicPropsObj.asKind(SyntaxKind.ObjectLiteralExpression)!;

                    for (const prop of propsObj.getProperties()) {
                        if (prop.getKind() === SyntaxKind.PropertyAssignment) {
                            const propAssignment = prop.asKind(SyntaxKind.PropertyAssignment)!;
                            const propName = propAssignment.getName();
                            const initializer = propAssignment.getInitializer();

                            if (initializer) {
                                const initText = initializer.getText();

                                this.logger.debug(`Property ${propName}: initText = "${initText}"`);

                                // Check if it's a token-based property
                                if (initText === 'true') {
                                    this.configCache.set(propName, 'freeform');
                                    this.logger.debug(`  -> classified as freeform`);
                                } else if (initText.includes('Tokens') || initText.includes('tokens')) {
                                    this.configCache.set(propName, 'token');
                                    this.tokenTypeMap.set(propName, initText);
                                    this.logger.debug(`  -> classified as token (${initText})`);
                                }
                            }
                        }
                    }
                }
            }

            // Find shorthands
            const shorthandsProperty = configObj
                .asKindOrThrow(SyntaxKind.ObjectLiteralExpression)
                .getProperty('shorthands');

            if (shorthandsProperty && shorthandsProperty.getKind() === SyntaxKind.PropertyAssignment) {
                const shorthandsObj = shorthandsProperty
                    .asKind(SyntaxKind.PropertyAssignment)!
                    .getInitializer();

                if (shorthandsObj && shorthandsObj.getKind() === SyntaxKind.ObjectLiteralExpression) {
                    const propsObj = shorthandsObj.asKind(SyntaxKind.ObjectLiteralExpression)!;

                    for (const prop of propsObj.getProperties()) {
                        if (prop.getKind() === SyntaxKind.PropertyAssignment) {
                            const propAssignment = prop.asKind(SyntaxKind.PropertyAssignment)!;
                            const propName = propAssignment.getName();
                            this.configCache.set(propName, 'shorthand');
                        }
                    }
                }
            }

            this.logger.debug(`Parsed ${this.configCache.size} property configurations`);
        } catch (error) {
            this.logger.warn(`Error parsing sprinkles config: ${error}`);
        }
    }

    /**
     * Generate type for free-form CSS properties
     */
    private generateFreeformType(propName: string): string {
        const cssValues = this.CSS_VALUES[propName];

        if (cssValues && cssValues.length > 0) {
            const unionType = cssValues.map(v => `"${v}"`).join(' | ');
            return `${unionType} | (string & {}) | undefined`;
        }

        return 'string | (string & {}) | undefined';
    }

    /**
     * Generate type for token-based properties
     */
    private generateTokenType(propName: string): string {
        const tokenType = this.getTokenType(propName);

        if (!tokenType) {
            return 'string | number | (string & {}) | (number & {}) | undefined';
        }

        // Extract token values
        let tokenValues: string[] = [];

        if (tokenType === 'spaceTokens') {
            tokenValues = this.extractTokenKeys('tokens/size/space.ts', 'SPACE');
        } else if (tokenType === 'marginTokens') {
            // Margin tokens include both positive and negative values
            const spaceTokens = this.extractTokenKeys('tokens/size/space.ts', 'SPACE');
            tokenValues = [
                ...spaceTokens,
                ...spaceTokens.map(t => `-${t}`)
            ];
        } else if (tokenType === 'dimensionTokens') {
            tokenValues = this.extractTokenKeys('tokens/size/dimension.ts', 'DIMENSION');
        } else if (tokenType === 'radiusTokens') {
            tokenValues = this.extractTokenKeys('tokens/size/border-radius.ts', 'BORDER_RADIUS');
        } else if (tokenType === 'bgColorTokens' || tokenType === 'colorTokens' || tokenType === 'borderColorTokens') {
            tokenValues = this.extractColorTokenKeys(tokenType);
        }

        if (tokenValues.length === 0) {
            return 'string | number | (string & {}) | (number & {}) | undefined';
        }

        const unionType = tokenValues.map(v => `"${v}"`).join(' | ');
        return `${unionType} | (string & {}) | (number & {}) | undefined`;
    }

    /**
     * Generate type for shorthand properties (paddingX, marginY, etc.)
     */
    private generateShorthandType(propName: string): string {
        // Shorthands typically map to token-based properties
        // paddingX -> padding (spaceTokens)
        // marginX -> margin (marginTokens)

        if (propName.startsWith('padding')) {
            const spaceTokens = this.extractTokenKeys('tokens/size/space.ts', 'SPACE');
            const unionType = spaceTokens.map(v => `"${v}"`).join(' | ');
            return `${unionType} | (string & {}) | (number & {}) | undefined`;
        } else if (propName.startsWith('margin')) {
            const spaceTokens = this.extractTokenKeys('tokens/size/space.ts', 'SPACE');
            const tokenValues = [
                ...spaceTokens,
                ...spaceTokens.map(t => `-${t}`)
            ];
            const unionType = tokenValues.map(v => `"${v}"`).join(' | ');
            return `${unionType} | (string & {}) | (number & {}) | undefined`;
        }

        return 'string | number | (string & {}) | (number & {}) | undefined';
    }

    /**
     * Extract token keys from a token file
     */
    private extractTokenKeys(tokenFilePath: string, exportName: string): string[] {
        const cacheKey = `${tokenFilePath}:${exportName}`;

        if (this.tokenCache.has(cacheKey)) {
            return this.tokenCache.get(cacheKey)!;
        }

        try {
            const fullPath = path.join(this.projectRoot, 'src/styles', tokenFilePath);
            this.logger.debug(`Extracting tokens from: ${fullPath}`);

            let sourceFile: SourceFile | undefined;
            try {
                sourceFile = this.project.getSourceFile(fullPath);
                if (!sourceFile) {
                    sourceFile = this.project.addSourceFileAtPath(fullPath);
                }
            } catch (error) {
                this.logger.warn(`Failed to load token file ${fullPath}: ${error}`);
                return [];
            }

            // Find the exported variable
            const varDecl = sourceFile.getVariableDeclaration(exportName);
            if (!varDecl) {
                this.logger.warn(`Could not find ${exportName} export in ${tokenFilePath}`);
                return [];
            }

            const initializer = varDecl.getInitializer();
            if (!initializer || initializer.getKind() !== SyntaxKind.ObjectLiteralExpression) {
                this.logger.warn(`${exportName} is not an object literal`);
                return [];
            }

            // Extract keys
            const keys: string[] = [];
            const obj = initializer.asKind(SyntaxKind.ObjectLiteralExpression)!;

            for (const prop of obj.getProperties()) {
                if (prop.getKind() === SyntaxKind.PropertyAssignment) {
                    const propAssignment = prop.asKind(SyntaxKind.PropertyAssignment)!;
                    const key = propAssignment.getName().replace(/['"]/g, '');
                    keys.push(key);
                }
            }

            this.logger.debug(`Extracted ${keys.length} tokens from ${exportName}`);
            this.tokenCache.set(cacheKey, keys);
            return keys;
        } catch (error) {
            this.logger.warn(`Error extracting tokens from ${tokenFilePath}: ${error}`);
            return [];
        }
    }

    /**
     * Extract color token keys from sprinkles.css.ts
     */
    private extractColorTokenKeys(tokenType: string): string[] {
        const cacheKey = `color:${tokenType}`;

        if (this.tokenCache.has(cacheKey)) {
            return this.tokenCache.get(cacheKey)!;
        }

        try {
            const sprinklesPath = path.join(this.projectRoot, 'src/styles/sprinkles.css.ts');

            let sourceFile: SourceFile | undefined;
            try {
                sourceFile = this.project.getSourceFile(sprinklesPath);
                if (!sourceFile) {
                    sourceFile = this.project.addSourceFileAtPath(sprinklesPath);
                }
            } catch (error) {
                this.logger.warn(`Failed to load sprinkles.css.ts for color tokens: ${error}`);
                return [];
            }

            // Find the color tokens variable
            const varDecl = sourceFile.getVariableDeclaration(tokenType);
            if (!varDecl) {
                this.logger.warn(`Could not find ${tokenType} in sprinkles.css.ts`);
                return [];
            }

            const initializer = varDecl.getInitializer();
            if (!initializer || initializer.getKind() !== SyntaxKind.ObjectLiteralExpression) {
                this.logger.warn(`${tokenType} is not an object literal`);
                return [];
            }

            // Extract keys
            const keys: string[] = [];
            const obj = initializer.asKind(SyntaxKind.ObjectLiteralExpression)!;

            for (const prop of obj.getProperties()) {
                if (prop.getKind() === SyntaxKind.PropertyAssignment) {
                    const propAssignment = prop.asKind(SyntaxKind.PropertyAssignment)!;
                    const key = propAssignment.getName().replace(/['"]/g, '');
                    keys.push(key);
                }
            }

            this.logger.debug(`Extracted ${keys.length} color tokens from ${tokenType}`);
            this.tokenCache.set(cacheKey, keys);
            return keys;
        } catch (error) {
            this.logger.warn(`Error extracting color tokens: ${error}`);
            return [];
        }
    }
}

/**
 * Resolves type information and determines if types are external
 */
export class TypeResolver {
    private sprinklesPropsSet: Set<string> | null = null;
    private sprinklesTypeExtractor: SprinklesTypeExtractor | null = null;

    constructor(
        private logger: Logger,
        private project: Project,
    ) {}

    /**
     * Check if a type is from an external library (node_modules)
     */
    isExternalType(symbol: Symbol): boolean {
        const declarations = symbol.getDeclarations();
        const isExternal = declarations.some((decl) => {
            const filePath = decl.getSourceFile().getFilePath();
            return filePath.includes('node_modules');
        });

        if (isExternal) {
            this.logger.debug(`Symbol ${symbol.getName()} is external`);
        }

        return isExternal;
    }

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
     * Check if a property is defined locally (not in node_modules)
     */
    isLocalProperty(prop: PropertySignature): boolean {
        const sourceFile = prop.getSourceFile();
        const filePath = sourceFile.getFilePath();

        const isLocal = filePath.includes('packages/core/src') && !filePath.includes('node_modules');

        this.logger.debug(`Property ${prop.getName()} is ${isLocal ? 'local' : 'external'} (${filePath})`);

        return isLocal;
    }

    /**
     * Check if a source file is from node_modules
     */
    isExternalSourceFile(sourceFile: SourceFile): boolean {
        return sourceFile.getFilePath().includes('node_modules');
    }

    /**
     * Check if a property is an HTML intrinsic element prop from @types/react
     * These props come from HTMLAttributes, AriaAttributes, or DOMAttributes
     */
    isHTMLIntrinsicProp(prop: PropertySignature): boolean {
        const sourceFile = prop.getSourceFile();
        const filePath = sourceFile.getFilePath();

        // Must be from @types/react
        if (!filePath.includes('node_modules/@types/react')) {
            return false;
        }

        // Check if property comes from HTML-related interfaces
        const symbol = prop.getSymbol();
        if (!symbol) return false;

        const declarations = symbol.getDeclarations();
        for (const decl of declarations) {
            // Check the parent interface/type name
            const parent = decl.getParent();
            if (!parent) continue;

            const parentText = parent.getText();

            // Check if it's from HTMLAttributes, AriaAttributes, or DOMAttributes
            if (
                parentText.includes('HTMLAttributes') ||
                parentText.includes('AriaAttributes') ||
                parentText.includes('DOMAttributes')
            ) {
                this.logger.debug(`Property ${prop.getName()} is HTML intrinsic`);
                return true;
            }
        }

        return false;
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

    /**
     * Check if a property name is a React special prop (ref, key)
     * These props are specific to React and should be filtered by default
     */
    isReactSpecialProp(propName: string): boolean {
        return propName === 'ref' || propName === 'key';
    }

    /**
     * Filter out React special props from a property list
     * @param props - List of property docs to filter
     * @param includeReactProps - If true, keeps React special props; if false, filters them out
     * @returns Filtered property list
     */
    filterReactSpecialProps(props: PropertyDoc[], includeReactProps: boolean): PropertyDoc[] {
        if (includeReactProps) {
            return props;
        }
        return props.filter((prop) => !this.isReactSpecialProp(prop.name));
    }

    /**
     * Load the list of sprinkles props from resolve-styles.ts
     * This is cached after the first load for performance
     */
    private loadSprinklesPropsSet(projectRoot: string): Set<string> {
        if (this.sprinklesPropsSet) {
            return this.sprinklesPropsSet;
        }

        const FALLBACK_SPRINKLES_PROPS = [
            'position',
            'display',
            'alignItems',
            'justifyContent',
            'flexDirection',
            'gap',
            'alignContent',
            'padding',
            'paddingTop',
            'paddingBottom',
            'paddingLeft',
            'paddingRight',
            'margin',
            'marginTop',
            'marginBottom',
            'marginLeft',
            'marginRight',
            'width',
            'height',
            'minWidth',
            'minHeight',
            'maxWidth',
            'maxHeight',
            'border',
            'borderColor',
            'borderRadius',
            'backgroundColor',
            'color',
            'opacity',
            'pointerEvents',
            'overflow',
            'textAlign',
            'paddingX',
            'paddingY',
            'marginX',
            'marginY',
        ];

        try {
            const resolveStylesPath = path.join(projectRoot, 'src/utils/resolve-styles.ts');

            this.logger.debug(`Loading sprinkles props from: ${resolveStylesPath}`);

            // Try to load existing source file or add it
            let sourceFile: SourceFile | undefined;
            try {
                sourceFile = this.project.getSourceFile(resolveStylesPath);
                if (!sourceFile) {
                    sourceFile = this.project.addSourceFileAtPath(resolveStylesPath);
                }
            } catch (error) {
                this.logger.warn(`Failed to load resolve-styles.ts: ${error}`);
                this.logger.warn('Using fallback sprinkles props list');
                this.sprinklesPropsSet = new Set(FALLBACK_SPRINKLES_PROPS);
                return this.sprinklesPropsSet;
            }

            // Find the createSplitProps call expression
            const callExpressions = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression);
            const createSplitPropsCall = callExpressions.find((call) => {
                const expr = call.getExpression();
                return expr.getText().includes('createSplitProps');
            });

            if (!createSplitPropsCall) {
                this.logger.warn('Could not find createSplitProps call in resolve-styles.ts');
                this.logger.warn('Using fallback sprinkles props list');
                this.sprinklesPropsSet = new Set(FALLBACK_SPRINKLES_PROPS);
                return this.sprinklesPropsSet;
            }

            // Get the second argument (the array of props)
            const args = createSplitPropsCall.getArguments();
            if (args.length < 2) {
                this.logger.warn('createSplitProps call does not have enough arguments');
                this.logger.warn('Using fallback sprinkles props list');
                this.sprinklesPropsSet = new Set(FALLBACK_SPRINKLES_PROPS);
                return this.sprinklesPropsSet;
            }

            const arrayArg = args[1];
            if (arrayArg.getKind() !== SyntaxKind.ArrayLiteralExpression) {
                this.logger.warn('Second argument of createSplitProps is not an array');
                this.logger.warn('Using fallback sprinkles props list');
                this.sprinklesPropsSet = new Set(FALLBACK_SPRINKLES_PROPS);
                return this.sprinklesPropsSet;
            }

            // Extract prop names from array
            const propsArray: string[] = [];
            arrayArg.forEachChild((child) => {
                if (child.getKind() === SyntaxKind.StringLiteral) {
                    const text = child.getText().replace(/['"]/g, '');
                    propsArray.push(text);
                }
            });

            this.logger.debug(`Loaded ${propsArray.length} sprinkles props from resolve-styles.ts`);
            this.sprinklesPropsSet = new Set(propsArray);
            return this.sprinklesPropsSet;
        } catch (error) {
            this.logger.warn(`Error loading sprinkles props: ${error}`);
            this.logger.warn('Using fallback sprinkles props list');
            this.sprinklesPropsSet = new Set(FALLBACK_SPRINKLES_PROPS);
            return this.sprinklesPropsSet;
        }
    }

    /**
     * Check if a property name is a sprinkles prop
     */
    isSprinklesProp(propName: string, projectRoot: string): boolean {
        const sprinklesSet = this.loadSprinklesPropsSet(projectRoot);
        return sprinklesSet.has(propName);
    }

    /**
     * Filter sprinkles props based on CLI option
     * @param props - List of property docs to filter
     * @param stylePropsOption - CLI option value: undefined | 'all' | 'prop1,prop2,...'
     * @param projectRoot - Root path of the project
     * @returns Filtered property list
     */
    filterSprinklesProps(
        props: PropertyDoc[],
        stylePropsOption: string | undefined,
        projectRoot: string,
    ): PropertyDoc[] {
        // Default: exclude all sprinkles props
        if (stylePropsOption === undefined) {
            return props.filter((prop) => !this.isSprinklesProp(prop.name, projectRoot));
        }

        // Show all sprinkles props
        if (stylePropsOption === 'all') {
            return props;
        }

        // Show specific sprinkles props
        const allowedSprinklesProps = new Set(
            stylePropsOption.split(',').map((s) => s.trim()),
        );

        // Validate and warn about invalid prop names
        for (const prop of allowedSprinklesProps) {
            if (!this.loadSprinklesPropsSet(projectRoot).has(prop)) {
                this.logger.warn(`Invalid sprinkles prop specified: ${prop}`);
            }
        }

        return props.filter((prop) => {
            const isSprinkles = this.isSprinklesProp(prop.name, projectRoot);

            // Keep non-sprinkles props
            if (!isSprinkles) return true;

            // Keep allowed sprinkles props
            return allowedSprinklesProps.has(prop.name);
        });
    }

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
        const sprinklesProps = Array.from(this.loadSprinklesPropsSet(projectRoot));
        const typeExtractor = this.getSprinklesTypeExtractor(projectRoot);

        this.logger.debug(`Creating ${sprinklesProps.length} synthetic sprinkles props with accurate types`);

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
