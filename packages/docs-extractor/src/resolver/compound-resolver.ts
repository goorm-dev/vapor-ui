import type { SourceFile } from 'ts-morph';

import type { Logger } from '../utils/logger';
import { formatDisplayName, splitDisplayName } from './alias-mapper';
import { COMPOUND_COMPONENT_BASES } from './compound-config';

/**
 * Information about a compound component and its parts
 */
export interface CompoundComponentInfo {
    /** Base component name (e.g., "Dialog") */
    baseName: string;
    /** All sub-component internal names (e.g., ["DialogRoot", "DialogTrigger", "DialogContent"]) */
    subComponents: string[];
    /** Mapping of display names to internal names */
    aliasMap: Map<string, string>;
}

/**
 * Compound Resolver - handles compound component structure analysis
 *
 * Analyzes source files to identify compound components and their parts.
 * Builds mappings between exported names (Dialog.Root) and internal names (DialogRoot).
 */
export class CompoundResolver {
    constructor(private logger: Logger) {}

    /**
     * Analyze a source file to find compound component structure
     */
    analyzeCompoundComponent(sourceFile: SourceFile): CompoundComponentInfo | null {
        // Get all exported variable names (component declarations)
        const exportedNames = this.getExportedComponentNames(sourceFile);

        if (exportedNames.length === 0) {
            return null;
        }

        // Try to identify the compound base
        const baseName = this.identifyCompoundBase(exportedNames);

        if (!baseName) {
            return null;
        }

        // Find all sub-components
        const subComponents = exportedNames.filter(
            (name) =>
                name.startsWith(baseName) &&
                name.length > baseName.length &&
                /^[A-Z]/.test(name.slice(baseName.length)),
        );

        if (subComponents.length === 0) {
            return null;
        }

        // Build alias map
        const aliasMap = new Map<string, string>();
        for (const subComp of subComponents) {
            const displayName = formatDisplayName(subComp);
            aliasMap.set(displayName, subComp);
        }

        this.logger.debug(
            `Found compound component: ${baseName} with ${subComponents.length} parts`,
        );

        return {
            baseName,
            subComponents,
            aliasMap,
        };
    }

    /**
     * Get all exported component names from a source file
     */
    private getExportedComponentNames(sourceFile: SourceFile): string[] {
        const names: string[] = [];

        // Get exported variable declarations
        const exportedVars = sourceFile.getVariableDeclarations().filter((decl) => {
            const varStatement = decl.getVariableStatement();
            return varStatement?.isExported();
        });

        for (const varDecl of exportedVars) {
            names.push(varDecl.getName());
        }

        return names;
    }

    /**
     * Identify the compound base name from a list of component names
     */
    private identifyCompoundBase(names: string[]): string | null {
        // Try each known compound base (longer first)
        for (const base of COMPOUND_COMPONENT_BASES) {
            const hasBaseComponents = names.some(
                (name) =>
                    name.startsWith(base) &&
                    name.length > base.length &&
                    /^[A-Z]/.test(name.slice(base.length)),
            );

            if (hasBaseComponents) {
                return base;
            }
        }

        return null;
    }

    /**
     * Check if a source file contains a compound component
     */
    isCompoundComponentFile(sourceFile: SourceFile): boolean {
        const names = this.getExportedComponentNames(sourceFile);
        return this.identifyCompoundBase(names) !== null;
    }

    /**
     * Get the display name for an internal component name
     */
    getDisplayName(internalName: string): string {
        return formatDisplayName(internalName);
    }

    /**
     * Parse parts info from a display name
     */
    parseDisplayName(displayName: string): { base: string; sub?: string } {
        return splitDisplayName(displayName);
    }
}
