/**
 * @vapor-ui/ts-api-extractor
 *
 * TypeScript AST-based API extractor for documentation generation.
 */

export { defaultExtractorConfig as config } from '~/domain/config/defaults';
export { defineConfig } from '~/domain/config/define-config';
export { loadExtractorConfig, type LoadConfigOptions } from '~/infrastructure/config/loader';
export type { ExtractorConfig } from '~/domain/config/schema';
