/**
 * Extraction Pipeline - orchestrates the documentation extraction process
 *
 * Pipeline stages:
 * 1. Symbol Loading - Load TypeScript symbols from source files
 * 2. Flattening - Flatten intersection types to get all properties
 * 3. Trace & Tagging - Classify props by their origin
 * 4. Enrichment - Add JSDoc descriptions and default values
 * 5. Grouping - Group props by category/source
 */
import type { ProjectAnalyzer } from '../analyzer';
import type { ComponentDocumentation } from '../types';
import type { Logger } from '../utils/logger';
import type { PipelineInput, PipelineOptions, PipelineOutput, StageData } from './types';

/**
 * Extraction Pipeline class
 */
export class ExtractionPipeline {
    constructor(
        private projectAnalyzer: ProjectAnalyzer,
        private logger: Logger,
    ) {}

    /**
     * Run the complete extraction pipeline
     */
    async run(input: PipelineInput): Promise<PipelineOutput> {
        this.logger.info('Starting extraction pipeline...');

        const results: ComponentDocumentation[] = [];
        let totalProps = 0;

        for (const component of input.components) {
            this.logger.debug(`Processing component: ${component.name}`);

            const stageData: StageData = { component };

            // Stage 1: Load source file
            stageData.sourceFile = this.projectAnalyzer.getSourceFile(component.filePath);

            if (!stageData.sourceFile) {
                this.logger.warn(`Could not load source file for ${component.name}`);
                continue;
            }

            // Further stages would be implemented here
            // For now, we create a placeholder output
            const componentDoc: ComponentDocumentation = {
                name: component.name,
                exports: [],
            };

            results.push(componentDoc);
        }

        return {
            components: results,
            metadata: {
                totalProps,
                propsBySource: {
                    'base-ui': 0,
                    sprinkles: 0,
                    variant: 0,
                    local: 0,
                    native: 0,
                },
            },
        };
    }

    /**
     * Create pipeline options from CLI flags
     */
    static createOptions(flags: {
        includeHtmlProps?: boolean;
        includeReactProps?: boolean;
        styleProps?: string;
    }): PipelineOptions {
        return {
            includeHtmlProps: flags.includeHtmlProps ?? false,
            includeReactProps: flags.includeReactProps ?? false,
            styleProps: flags.styleProps,
        };
    }
}
