/**
 * Base UI Extractor - extracts documentation from @base-ui-components
 *
 * This module handles the extraction of JSDoc and type information
 * from the base-ui-components library's type definitions.
 */
import type { InterfaceDeclaration, Project, SourceFile, TypeAliasDeclaration } from 'ts-morph';

import type { Logger } from '../utils/logger';

/**
 * Extracted documentation from Base UI
 */
export interface BaseUIDocumentation {
    /** Property name */
    name: string;
    /** JSDoc description */
    description?: string;
    /** Type as string */
    type: string;
    /** Default value if specified */
    defaultValue?: string;
    /** Whether the prop is required */
    required: boolean;
}

/**
 * Base UI Extractor class
 */
export class BaseUIExtractor {
    private project: Project;

    constructor(
        project: Project,
        private logger: Logger,
    ) {
        this.project = project;
    }

    /**
     * Find and load the Base UI type definition file for a component
     */
    findBaseUITypeFile(componentName: string): SourceFile | null {
        // Try to find the type definition file in node_modules
        const possiblePaths = [
            `node_modules/@base-ui-components/react/${componentName.toLowerCase()}/index.d.ts`,
            `node_modules/@base-ui-components/react/dist/${componentName.toLowerCase()}/index.d.ts`,
        ];

        for (const relativePath of possiblePaths) {
            try {
                const sourceFile = this.project.addSourceFileAtPath(relativePath);
                if (sourceFile) {
                    this.logger.debug(`Found Base UI types at ${relativePath}`);
                    return sourceFile;
                }
            } catch {
                // File not found, try next path
            }
        }

        this.logger.debug(`No Base UI types found for ${componentName}`);
        return null;
    }

    /**
     * Extract Props interface from a Base UI type file
     */
    extractPropsInterface(
        sourceFile: SourceFile,
        componentName: string,
    ): InterfaceDeclaration | TypeAliasDeclaration | null {
        // Try namespace pattern first (e.g., namespace Dialog { interface Props })
        const namespace = sourceFile.getModule(componentName);
        if (namespace) {
            const propsInterface = namespace.getInterface('Props');
            if (propsInterface) {
                return propsInterface;
            }

            const propsTypeAlias = namespace.getTypeAlias('Props');
            if (propsTypeAlias) {
                return propsTypeAlias;
            }
        }

        // Try direct interface pattern (e.g., DialogProps)
        const directInterface = sourceFile.getInterface(`${componentName}Props`);
        if (directInterface) {
            return directInterface;
        }

        return null;
    }

    /**
     * Extract documentation from a Props interface
     */
    extractPropsDocumentation(
        propsDeclaration: InterfaceDeclaration | TypeAliasDeclaration,
    ): BaseUIDocumentation[] {
        const docs: BaseUIDocumentation[] = [];

        if (propsDeclaration.getKindName() === 'InterfaceDeclaration') {
            const interfaceDecl = propsDeclaration as InterfaceDeclaration;
            const properties = interfaceDecl.getProperties();

            for (const prop of properties) {
                const jsDocs = prop.getJsDocs();
                const description =
                    jsDocs.length > 0 ? jsDocs[0].getDescription().trim() : undefined;

                docs.push({
                    name: prop.getName(),
                    description,
                    type: prop.getType().getText(),
                    required: !prop.hasQuestionToken(),
                    defaultValue: this.extractDefaultFromJsDoc(jsDocs),
                });
            }
        }

        return docs;
    }

    /**
     * Extract @default value from JSDoc comments
     */
    private extractDefaultFromJsDoc(
        jsDocs: ReturnType<InterfaceDeclaration['getJsDocs']>,
    ): string | undefined {
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
     * Check if a source file is from Base UI
     */
    isBaseUIFile(filePath: string): boolean {
        return filePath.includes('node_modules/@base-ui-components');
    }
}
