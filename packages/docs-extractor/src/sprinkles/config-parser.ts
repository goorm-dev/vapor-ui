import path from 'path';
import type { Project, SourceFile } from 'ts-morph';
import { SyntaxKind } from 'ts-morph';

import type { Logger } from '../utils/logger.js';

/**
 * Property configuration type for sprinkles
 */
export type SprinklesPropertyConfig = 'token' | 'freeform' | 'shorthand';

/**
 * Parsed sprinkles configuration
 */
export interface SprinklesConfig {
    propertyConfigs: Map<string, SprinklesPropertyConfig>;
    tokenTypeMap: Map<string, string>;
}

/**
 * Parses sprinkles.css.ts configuration to extract property configurations and token mappings
 */
export class SprinklesConfigParser {
    private configCache: Map<string, SprinklesPropertyConfig> | null = null;
    private tokenTypeMap: Map<string, string> | null = null;
    private tokenCache: Map<string, string[]> = new Map();

    constructor(
        private logger: Logger,
        private project: Project,
        private projectRoot: string,
    ) {}

    /**
     * Get the configuration type for a property
     */
    getPropertyConfig(propName: string): SprinklesPropertyConfig {
        if (!this.configCache || !this.tokenTypeMap) {
            this.parseSprinklesConfig();
        }

        return this.configCache!.get(propName) || 'freeform';
    }

    /**
     * Get the token type (spaceTokens, dimensionTokens, etc.) for a property
     */
    getTokenType(propName: string): string | null {
        if (!this.tokenTypeMap) {
            this.parseSprinklesConfig();
        }

        return this.tokenTypeMap!.get(propName) || null;
    }

    /**
     * Extract token keys from a token file
     */
    extractTokenKeys(tokenFilePath: string, exportName: string): string[] {
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
    extractColorTokenKeys(tokenType: string): string[] {
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

            if (
                dynamicPropsProperty &&
                dynamicPropsProperty.getKind() === SyntaxKind.PropertyAssignment
            ) {
                const dynamicPropsObj = dynamicPropsProperty
                    .asKind(SyntaxKind.PropertyAssignment)!
                    .getInitializer();

                if (
                    dynamicPropsObj &&
                    dynamicPropsObj.getKind() === SyntaxKind.ObjectLiteralExpression
                ) {
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
                                } else if (
                                    initText.includes('Tokens') ||
                                    initText.includes('tokens')
                                ) {
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

            if (
                shorthandsProperty &&
                shorthandsProperty.getKind() === SyntaxKind.PropertyAssignment
            ) {
                const shorthandsObj = shorthandsProperty
                    .asKind(SyntaxKind.PropertyAssignment)!
                    .getInitializer();

                if (
                    shorthandsObj &&
                    shorthandsObj.getKind() === SyntaxKind.ObjectLiteralExpression
                ) {
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
}
