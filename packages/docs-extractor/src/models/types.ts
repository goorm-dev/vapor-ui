/**
 * Prop source classification based on origin file path
 * - base-ui: Props from @base-ui-components
 * - sprinkles: Props from sprinkles.css.ts (style system)
 * - variant: Props from .css.ts recipe files
 * - local: Props defined in project .tsx/.ts files
 * - native: Props from @types/react (HTML intrinsic)
 */
export type PropSource = 'base-ui' | 'sprinkles' | 'variant' | 'local' | 'native';

/**
 * Metadata about a component property
 */
export interface PropertyDoc {
    name: string;
    type: string;
    detailedType?: string; // Prettier로 포맷팅된 멀티라인 타입 (render, className 등 복잡한 타입용)
    required: boolean;
    description?: string;
    defaultValue?: string;
    deprecated?: boolean;
    tags: Record<string, string>;
    isExternal: boolean;
    isHTMLIntrinsic: boolean;
    isSprinklesProp?: boolean; // Whether this is a sprinkles (style utility) prop
    sourceFile?: string;
    values?: string[]; // Parsed values for union types (e.g., "a" | "b" | "c" → ["a", "b", "c"])
}

/**
 * Merged property documentation combining local and external docs
 */
export interface MergedPropertyDoc extends PropertyDoc {
    source: 'local' | 'external' | 'merged';
    propSource?: PropSource; // Origin classification
    originFile?: string; // Source file path for the prop
    localDoc?: PropertyDoc;
    externalDoc?: PropertyDoc;
}

/**
 * Metadata about a component file
 */
export interface ComponentMetadata {
    name: string; // e.g., "Button", "Checkbox"
    displayName: string; // e.g., "Button", "Checkbox.Root"
    filePath: string; // Absolute path to .tsx file
    exportType: 'default' | 'named' | 'namespace';
    hasNamespace: boolean; // true for components with .Root pattern
}

/**
 * Information about a single variant option
 */
export interface VariantInfo {
    name: string; // "size", "colorPalette"
    type: string[]; // ["sm", "md", "lg"]
    defaultValue?: string; // "md"
    description?: string; // JSDoc description if available
    required: boolean; // true if no defaultValue, false if has defaultValue
}

/**
 * Complete variants information for a component
 */
export interface ComponentVariants {
    sourceFile: string; // Path to .css.ts file
    variants: VariantInfo[];
}

/**
 * A single component export (could be a component or namespace member)
 */
export interface ComponentExport {
    type: 'component' | 'namespace';
    name: string; // "Button" or "CheckboxRoot"
    displayName: string; // "Button" or "Checkbox.Root"
    description?: string; // JSDoc description of the component
    props: MergedPropertyDoc[];
    variants?: ComponentVariants; // Vanilla-extract variants if available
    typeParameters?: string[];
}

/**
 * Complete documentation for a component file
 */
export interface ComponentDocumentation {
    name: string; // "Button" or "Checkbox"
    description?: string;
    exports: ComponentExport[];
}

/**
 * The final output structure
 */
export interface ExtractorOutput {
    metadata: {
        version: string;
        generatedAt: string;
        rootPath: string;
        componentCount: number;
    };
    components: ComponentDocumentation[];
}

/**
 * Configuration options for the extractor
 */
export interface ExtractorOptions {
    rootPath: string;
    component?: string;
    verbose?: boolean;
    outputPath?: string;
}
