/**
 * External Doc Parser - parses .d.ts files from node_modules
 *
 * This module provides utilities for extracting documentation
 * from TypeScript declaration files in external packages.
 */
import type { JSDoc, Project, PropertySignature, SourceFile } from 'ts-morph';

import type { Logger } from '../utils/logger';

/**
 * Parsed property documentation from external library
 */
export interface ExternalPropertyDoc {
    name: string;
    type: string;
    description?: string;
    defaultValue?: string;
    required: boolean;
    deprecated?: boolean;
    tags: Record<string, string>;
}

/**
 * External Doc Parser class
 */
export class ExternalDocParser {
    constructor(
        private project: Project,
        private logger: Logger,
    ) {}

    /**
     * Parse a .d.ts file and extract all interface properties
     */
    parseDeclarationFile(filePath: string): Map<string, ExternalPropertyDoc[]> {
        const result = new Map<string, ExternalPropertyDoc[]>();

        try {
            const sourceFile = this.project.addSourceFileAtPath(filePath);
            const interfaces = sourceFile.getInterfaces();

            for (const iface of interfaces) {
                const interfaceName = iface.getName();
                const properties = this.parseInterfaceProperties(iface.getProperties());
                result.set(interfaceName, properties);
            }

            this.logger.debug(`Parsed ${interfaces.length} interfaces from ${filePath}`);
        } catch (error) {
            this.logger.warn(`Failed to parse declaration file ${filePath}: ${error}`);
        }

        return result;
    }

    /**
     * Parse properties from an interface
     */
    private parseInterfaceProperties(properties: PropertySignature[]): ExternalPropertyDoc[] {
        return properties.map((prop) => this.parseProperty(prop));
    }

    /**
     * Parse a single property signature
     */
    private parseProperty(prop: PropertySignature): ExternalPropertyDoc {
        const jsDocs = prop.getJsDocs();

        return {
            name: prop.getName(),
            type: prop.getType().getText(),
            description: this.extractDescription(jsDocs),
            defaultValue: this.extractDefaultValue(jsDocs),
            required: !prop.hasQuestionToken(),
            deprecated: this.isDeprecated(jsDocs),
            tags: this.extractTags(jsDocs),
        };
    }

    /**
     * Extract description from JSDoc
     */
    private extractDescription(jsDocs: JSDoc[]): string | undefined {
        if (jsDocs.length === 0) return undefined;
        const description = jsDocs[0].getDescription().trim();
        return description || undefined;
    }

    /**
     * Extract @default value from JSDoc
     */
    private extractDefaultValue(jsDocs: JSDoc[]): string | undefined {
        for (const jsDoc of jsDocs) {
            const defaultTag = jsDoc.getTags().find((tag) => tag.getTagName() === 'default');
            if (defaultTag) {
                const comment = defaultTag.getComment();
                if (typeof comment === 'string') {
                    return comment.trim();
                }
            }
        }
        return undefined;
    }

    /**
     * Check if property is deprecated
     */
    private isDeprecated(jsDocs: JSDoc[]): boolean {
        return jsDocs.some((jsDoc) =>
            jsDoc.getTags().some((tag) => tag.getTagName() === 'deprecated'),
        );
    }

    /**
     * Extract all JSDoc tags
     */
    private extractTags(jsDocs: JSDoc[]): Record<string, string> {
        const tags: Record<string, string> = {};

        for (const jsDoc of jsDocs) {
            for (const tag of jsDoc.getTags()) {
                const tagName = tag.getTagName();
                const comment = tag.getComment();
                tags[tagName] = typeof comment === 'string' ? comment : '';
            }
        }

        return tags;
    }

    /**
     * Try to load a source file from node_modules
     */
    tryLoadNodeModulesFile(packagePath: string): SourceFile | null {
        const fullPath = `node_modules/${packagePath}`;
        try {
            return this.project.addSourceFileAtPath(fullPath);
        } catch {
            this.logger.debug(`Could not load ${fullPath}`);
            return null;
        }
    }

    /**
     * Check if a file path is in node_modules
     */
    isNodeModulesPath(filePath: string): boolean {
        return filePath.includes('node_modules');
    }
}
