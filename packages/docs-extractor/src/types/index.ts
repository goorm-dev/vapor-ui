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
    values: string[]; // ["sm", "md", "lg"]
    defaultValue?: string; // "md"
    description?: string; // JSDoc description if available
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
