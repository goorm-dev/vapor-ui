import path from 'node:path';

import type { ExtractComponentMetadataInput } from '~/application/dto/extract-input';
import type { ExtractComponentMetadataOutput } from '~/application/dto/extract-output';
import { componentsToJson } from '~/application/mappers/component-model-to-json.mapper';
import type { FormatterPort } from '~/application/ports/formatter.port';
import type { LoggerPort } from '~/application/ports/logger.port';
import type { MetadataExtractorPort } from '~/application/ports/metadata-extractor.port';
import type { OutputWriterPort } from '~/application/ports/output-writer.port';
import { parsedComponentsToModels } from '~/domain/services/build-component-model';

export interface ExtractComponentMetadataUseCaseDeps {
    metadataExtractor: MetadataExtractorPort;
    outputWriter: OutputWriterPort;
    formatter: FormatterPort;
    logger: LoggerPort;
    toFileName: (componentName: string) => string;
}

export class ExtractComponentMetadataUseCase {
    constructor(private readonly deps: ExtractComponentMetadataUseCaseDeps) {}

    execute(input: ExtractComponentMetadataInput): ExtractComponentMetadataOutput {
        this.deps.metadataExtractor.init(input.tsconfigPath);
        this.deps.logger.info('Parsing components...');

        const parsed = input.targetFiles.flatMap((filePath) => {
            const componentName = path.basename(filePath, path.extname(filePath));

            try {
                this.deps.logger.info(`Processing ${componentName}`);
                const effectiveOptions = input.resolveExtractOptions
                    ? input.resolveExtractOptions(filePath, input.extractOptions)
                    : input.extractOptions;

                return this.deps.metadataExtractor.extractFromFile(filePath, {
                    ...effectiveOptions,
                    verbose: input.verbose,
                });
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                this.deps.logger.warn(
                    `[docs-extractor] Failed to extract props for ${componentName}: ${message}`,
                );
                return [];
            }
        });

        const models = parsedComponentsToModels(parsed);
        const props = componentsToJson(models);

        this.deps.logger.info(`Done! Extracted ${props.length} components.`);

        const writtenFiles: string[] = [];

        for (const lang of input.languages) {
            const langOutputDir = path.join(input.outputDir, lang);
            const files = this.deps.outputWriter.writeMultipleFiles(props, langOutputDir, (prop) =>
                this.deps.toFileName(prop.name),
            );
            writtenFiles.push(...files);
            this.deps.formatter.format(files);
        }

        return {
            parsed,
            models,
            props,
            writtenFiles,
        };
    }
}
