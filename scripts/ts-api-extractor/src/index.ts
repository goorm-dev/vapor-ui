/**
 * @vapor-ui/ts-api-extractor
 *
 * TypeScript AST-based API extractor for documentation generation.
 */

export {
    buildExtractOptions,
    config,
    defineConfig,
    getComponentExtractOptions,
    loadExtractorConfig,
    resolveConfigForCli,
    type ExtractorConfig,
} from './config';

export { ExtractComponentMetadataUseCase } from '~/application/use-cases/extract-component-metadata.usecase';
export type { ExtractComponentMetadataInput } from '~/application/dto/extract-input';
export type { ExtractComponentMetadataOutput } from '~/application/dto/extract-output';
