/**
 * @vapor-ui/ts-api-extractor
 *
 * TypeScript AST-based API extractor for documentation generation.
 */

export { defaultExtractorConfig as config } from '~/config/defaults';
export { defineConfig } from '~/config/define-config';
export { loadExtractorConfig, type LoadConfigOptions } from '~/config/loader';
export type { ExtractorConfig } from '~/config/schema';
