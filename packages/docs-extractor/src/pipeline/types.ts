/**
 * Pipeline type definitions
 */
import type { SourceFile } from 'ts-morph';

import type {
    ComponentDocumentation,
    ComponentMetadata,
    MergedPropertyDoc,
    PropSource,
} from '../types';

/**
 * Pipeline stage interface
 */
export interface PipelineStage<TInput, TOutput> {
    /** Stage name for logging */
    name: string;
    /** Execute the stage */
    execute(input: TInput): Promise<TOutput>;
}

/**
 * Input for the extraction pipeline
 */
export interface PipelineInput {
    /** Components to extract documentation for */
    components: ComponentMetadata[];
    /** Core package path */
    corePackagePath: string;
    /** Options for extraction */
    options: PipelineOptions;
}

/**
 * Pipeline options
 */
export interface PipelineOptions {
    includeHtmlProps: boolean;
    includeReactProps: boolean;
    styleProps?: string;
}

/**
 * Output from the extraction pipeline
 */
export interface PipelineOutput {
    components: ComponentDocumentation[];
    metadata: {
        totalProps: number;
        propsBySource: Record<PropSource, number>;
    };
}

/**
 * Data passed between pipeline stages
 */
export interface StageData {
    /** Original component metadata */
    component: ComponentMetadata;
    /** Loaded source file */
    sourceFile?: SourceFile;
    /** Raw property docs */
    rawProps?: MergedPropertyDoc[];
    /** Classified props with source information */
    classifiedProps?: MergedPropertyDoc[];
    /** Enriched props with descriptions and defaults */
    enrichedProps?: MergedPropertyDoc[];
    /** Final grouped and processed props */
    finalProps?: MergedPropertyDoc[];
}
