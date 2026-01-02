/**
 * Source Detector - detects prop source from file paths
 *
 * Classifies properties based on where they are defined:
 * - base-ui: From @base-ui-components library
 * - sprinkles: From sprinkles.css.ts (style system)
 * - variant: From .css.ts recipe files
 * - local: From project source files
 * - native: From @types/react (HTML intrinsic elements)
 */
import type { PropSource } from '../types';
import { DEFAULT_PATH_PATTERNS, type PathPatterns } from './types';

/**
 * Source Detector class
 */
export class SourceDetector {
    private patterns: Required<PathPatterns>;

    constructor(customPatterns?: Partial<PathPatterns>) {
        this.patterns = {
            ...DEFAULT_PATH_PATTERNS,
            ...customPatterns,
        };
    }

    /**
     * Classify a prop's source based on its declaration file path
     *
     * Classification priority (first match wins):
     * 1. native: @types/react (HTML intrinsic props)
     * 2. base-ui: @base-ui-components
     * 3. sprinkles: sprinkles.css.ts
     * 4. variant: any .css.ts file (but not sprinkles)
     * 5. local: everything else (project files)
     */
    classifyByPath(filePath: string): PropSource {
        // Normalize path for consistent matching
        const normalizedPath = filePath.replace(/\\/g, '/');

        // 1. Check for React/native types first (highest priority for filtering)
        if (this.patterns.native.test(normalizedPath)) {
            return 'native';
        }

        // 2. Check for base-ui library
        if (this.patterns.baseUi.test(normalizedPath)) {
            return 'base-ui';
        }

        // 3. Check for sprinkles (before variant, as sprinkles is more specific)
        if (this.patterns.sprinkles.test(normalizedPath)) {
            return 'sprinkles';
        }

        // 4. Check for variant/recipe files
        if (this.patterns.variant.test(normalizedPath)) {
            return 'variant';
        }

        // 5. Default to local
        return 'local';
    }

    /**
     * Check if a path is from the base-ui library
     */
    isFromBaseUI(filePath: string): boolean {
        return this.classifyByPath(filePath) === 'base-ui';
    }

    /**
     * Check if a path is from sprinkles
     */
    isFromSprinkles(filePath: string): boolean {
        return this.classifyByPath(filePath) === 'sprinkles';
    }

    /**
     * Check if a path is from a variant/recipe file
     */
    isFromVariant(filePath: string): boolean {
        return this.classifyByPath(filePath) === 'variant';
    }

    /**
     * Check if a path is from React native types
     */
    isNativeReactProp(filePath: string): boolean {
        return this.classifyByPath(filePath) === 'native';
    }

    /**
     * Check if a path is from a local project file
     */
    isLocalProp(filePath: string): boolean {
        return this.classifyByPath(filePath) === 'local';
    }

    /**
     * Check if a path is from any external source (not local)
     */
    isExternalProp(filePath: string): boolean {
        const source = this.classifyByPath(filePath);
        return source !== 'local';
    }

    /**
     * Check if a path is from node_modules
     */
    isFromNodeModules(filePath: string): boolean {
        return filePath.includes('node_modules');
    }
}
