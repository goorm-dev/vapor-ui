/**
 * Domain model types.
 *
 * These types represent normalized data with domain rules applied.
 * They can be reused by different consumers (JSON, YAML, IDE tooling, etc.).
 */

export type PropCategory = 'required' | 'variants' | 'state' | 'custom' | 'base-ui' | 'composition';

/**
 * Normalized prop model.
 */
export interface PropModel {
    name: string;
    types: string[]; // Normalized as an array of type strings.
    required: boolean;
    description?: string;
    defaultValue?: string;
    category: PropCategory;
}

/**
 * Normalized component model.
 */
export interface ComponentModel {
    name: string;
    displayName: string;
    description?: string;
    props: PropModel[];
}

/**
 * File-level extraction result model.
 */
export interface FileResultModel {
    filePath: string;
    components: ComponentModel[];
}
