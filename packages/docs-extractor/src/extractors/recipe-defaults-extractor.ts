import path from 'path';
import type {
    IndexedAccessTypeNode,
    InterfaceDeclaration,
    PropertySignature,
    SourceFile,
} from 'ts-morph';
import { Node, SyntaxKind } from 'ts-morph';

import type { Logger } from '../utils/logger';
import type { ProjectAnalyzer } from './project-analyzer';

/**
 * Information about a recipe-based type
 */
interface RecipeTypeInfo {
    objectTypeName: string; // e.g., "Typography"
    indexKey: string; // e.g., "style"
    property: PropertySignature;
}

/**
 * Extracts default values from vanilla-extract recipe mixins
 * for component props that use indexed access types like Type['key']
 */
export class RecipeDefaultsExtractor {
    private recipeCache = new Map<string, Map<string, string>>();

    constructor(private logger: Logger) {}

    /**
     * Extract default values from recipe mixins for all props in an interface
     * Returns a map of prop names to their default values
     */
    extractDefaultsForProps(
        propsInterface: InterfaceDeclaration,
        projectAnalyzer: ProjectAnalyzer,
    ): Map<string, string> {
        const defaults = new Map<string, string>();
        const sourceFile = propsInterface.getSourceFile();

        this.logger.debug(
            `Extracting recipe defaults for props interface: ${propsInterface.getName()}`,
        );
        this.logger.debug(`Interface file: ${sourceFile.getFilePath()}`);

        // Get all properties from the interface
        const properties = propsInterface.getProperties();

        this.logger.debug(
            `Found ${properties.length} properties in interface using getProperties()`,
        );

        for (const prop of properties) {
            const propName = prop.getName();
            this.logger.debug(`Analyzing property: ${propName}`);

            const recipeInfo = this.analyzePropertyType(prop);

            if (!recipeInfo) {
                this.logger.debug(`Property ${propName} is not a recipe type`);
                continue; // Not a recipe type, skip
            }

            this.logger.debug(
                `Found recipe type: ${recipeInfo.objectTypeName}['${recipeInfo.indexKey}'] for prop ${prop.getName()}`,
            );

            // Resolve import to find the recipe file
            const recipeFilePath = this.resolveRecipeImport(recipeInfo.objectTypeName, sourceFile);

            if (!recipeFilePath) {
                this.logger.debug(`Could not resolve import for ${recipeInfo.objectTypeName}`);
                continue;
            }

            this.logger.debug(`Resolved recipe file: ${recipeFilePath}`);

            // Load and parse the recipe file
            let recipeSourceFile: SourceFile | undefined;
            try {
                recipeSourceFile =
                    projectAnalyzer.getSourceFile(recipeFilePath) ||
                    projectAnalyzer.getProject().addSourceFileAtPath(recipeFilePath);
            } catch (error) {
                this.logger.warn(`Failed to load recipe file ${recipeFilePath}: ${error}`);
                continue;
            }

            // Extract defaults from the recipe
            const recipeDefaults = this.getRecipeDefaults(recipeSourceFile, recipeFilePath);

            // Get the default value for this specific variant key
            const defaultValue = recipeDefaults.get(recipeInfo.indexKey);

            if (defaultValue) {
                this.logger.debug(
                    `Found default value "${defaultValue}" for ${recipeInfo.indexKey}`,
                );
                defaults.set(prop.getName(), defaultValue);
            }
        }

        return defaults;
    }

    /**
     * Analyze a property's type to determine if it's from a recipe
     * Returns recipe type info if it's an indexed access type like Type['key']
     */
    private analyzePropertyType(prop: PropertySignature): RecipeTypeInfo | null {
        const typeNode = prop.getTypeNode();

        if (!typeNode) {
            this.logger.debug(`No type node for property ${prop.getName()}`);
            return null;
        }

        const kind = typeNode.getKind();
        this.logger.debug(
            `Type node kind for ${prop.getName()}: ${kind} (IndexedAccessType is ${SyntaxKind.IndexedAccessType})`,
        );

        // Check if it's an indexed access type (e.g., Typography['style'])
        if (kind !== SyntaxKind.IndexedAccessType) {
            return null;
        }

        // Cast to access indexed access type methods
        const indexedAccessType = typeNode as IndexedAccessTypeNode;

        // Get object type and index type
        const objectTypeNode = indexedAccessType.getObjectTypeNode?.();
        const indexTypeNode = indexedAccessType.getIndexTypeNode?.();

        if (!objectTypeNode || !indexTypeNode) {
            this.logger.debug(`Missing object or index type node for ${prop.getName()}`);
            return null;
        }

        const objectTypeName = objectTypeNode.getText();
        const indexKey = indexTypeNode.getText().replace(/['"]/g, '');

        this.logger.debug(`Found indexed access type: ${objectTypeName}['${indexKey}']`);

        return {
            objectTypeName,
            indexKey,
            property: prop,
        };
    }

    /**
     * Resolve the import source of a type to find the recipe file path
     */
    private resolveRecipeImport(typeName: string, sourceFile: SourceFile): string | null {
        this.logger.debug(`Resolving import for type: ${typeName}`);

        // Find import declaration for the type
        const imports = sourceFile.getImportDeclarations();
        this.logger.debug(`Found ${imports.length} imports in file`);

        for (const importDecl of imports) {
            const namedImports = importDecl.getNamedImports();
            const typeImport = namedImports.find(
                (ni) => ni.getName() === typeName || ni.getAliasNode()?.getText() === typeName,
            );

            if (typeImport) {
                const moduleSpecifier = importDecl.getModuleSpecifierValue();
                this.logger.debug(`Found import: ${typeName} from '${moduleSpecifier}'`);
                const resolved = this.resolveModulePath(moduleSpecifier, sourceFile);
                this.logger.debug(`Resolved to: ${resolved}`);
                return resolved;
            }
        }

        this.logger.debug(`No import found for type: ${typeName}`);
        return null;
    }

    /**
     * Resolve module path, handling ~ alias and relative imports
     */
    private resolveModulePath(specifier: string, fromFile: SourceFile): string {
        const fromPath = fromFile.getFilePath();

        // Handle ~ alias: ~/styles/mixins/typography.css
        if (specifier.startsWith('~')) {
            const coreDir = this.findCorePackageDir(fromPath);
            const relativePath = specifier.replace('~/', 'src/');
            return path.join(coreDir, relativePath + '.ts');
        }

        // Handle relative imports: ./typography.css
        if (specifier.startsWith('.')) {
            const dir = path.dirname(fromPath);
            const resolved = path.resolve(dir, specifier);
            // Add .ts extension if not present
            return resolved.endsWith('.ts') ? resolved : resolved + '.ts';
        }

        // Return as-is for absolute or node_modules imports
        return specifier;
    }

    /**
     * Find the packages/core directory from any file path
     */
    private findCorePackageDir(filePath: string): string {
        const segments = filePath.split(path.sep);
        const coreIndex = segments.lastIndexOf('core');

        if (coreIndex === -1) {
            // Fallback: assume we're already in core or need to go up
            return path.dirname(filePath);
        }

        return segments.slice(0, coreIndex + 1).join(path.sep);
    }

    /**
     * Get default values from a recipe file (with caching)
     */
    private getRecipeDefaults(
        recipeSourceFile: SourceFile,
        recipeFilePath: string,
    ): Map<string, string> {
        // Check cache first
        if (this.recipeCache.has(recipeFilePath)) {
            this.logger.debug(`Using cached recipe defaults for ${recipeFilePath}`);
            return this.recipeCache.get(recipeFilePath)!;
        }

        // Parse and cache
        const defaults = this.parseRecipeDefaults(recipeSourceFile);
        this.recipeCache.set(recipeFilePath, defaults);

        return defaults;
    }

    /**
     * Parse defaultVariants from a recipe() call in a .css.ts file
     */
    private parseRecipeDefaults(recipeSourceFile: SourceFile): Map<string, string> {
        const defaults = new Map<string, string>();

        // Find recipe() call
        const recipeCalls = recipeSourceFile
            .getDescendantsOfKind(SyntaxKind.CallExpression)
            .filter((call) => call.getExpression().getText() === 'recipe');

        if (recipeCalls.length === 0) {
            this.logger.debug('No recipe() call found in file');
            return defaults;
        }

        // Process each recipe call (there might be multiple exports)
        for (const recipeCall of recipeCalls) {
            const [configArg] = recipeCall.getArguments();

            if (!Node.isObjectLiteralExpression(configArg)) {
                continue;
            }

            // Find defaultVariants property
            const defaultsProperty = configArg.getProperty('defaultVariants');

            if (!defaultsProperty || !Node.isPropertyAssignment(defaultsProperty)) {
                continue;
            }

            const defaultsObj = defaultsProperty.getInitializer();

            if (!Node.isObjectLiteralExpression(defaultsObj)) {
                continue;
            }

            // Extract all variant defaults
            defaultsObj.getProperties().forEach((prop) => {
                if (Node.isPropertyAssignment(prop)) {
                    const variantKey = prop.getName();
                    const initializer = prop.getInitializer();

                    if (initializer) {
                        const value = initializer.getText().replace(/['"]/g, '');
                        defaults.set(variantKey, value);
                        this.logger.debug(`Extracted default: ${variantKey} = ${value}`);
                    }
                }
            });
        }

        return defaults;
    }
}
