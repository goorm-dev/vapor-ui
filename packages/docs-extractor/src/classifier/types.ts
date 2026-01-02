/**
 * Classifier type definitions
 */
import type { PropSource } from '../types';

/**
 * Result of classifying a property's origin
 */
export interface ClassificationResult {
    /** The source classification */
    source: PropSource;
    /** The original file path where the prop was defined */
    originFile: string;
    /** Additional context about the classification */
    context?: string;
}

/**
 * Options for classification
 */
export interface ClassificationOptions {
    /** Whether to include detailed origin file tracking */
    trackOriginFiles?: boolean;
    /** Custom path patterns for classification */
    customPatterns?: PathPatterns;
}

/**
 * Path patterns for source classification
 */
export interface PathPatterns {
    /** Pattern to match base-ui library paths */
    baseUi?: RegExp;
    /** Pattern to match sprinkles paths */
    sprinkles?: RegExp;
    /** Pattern to match variant/recipe paths */
    variant?: RegExp;
    /** Pattern to match React type paths */
    native?: RegExp;
}

/**
 * Default path patterns for classification
 */
export const DEFAULT_PATH_PATTERNS: Required<PathPatterns> = {
    baseUi: /node_modules\/@base-ui-components/,
    sprinkles: /sprinkles\.css\.ts$/,
    variant: /\.css\.ts$/,
    native: /node_modules\/@types\/react/,
};
