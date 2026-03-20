import type { ExtractOptions } from '~/application/dto/extract-options';

export interface ExtractComponentMetadataInput {
    tsconfigPath: string;
    targetFiles: string[];
    extractOptions: ExtractOptions;
    outputDir: string;
    languages: string[];
    verbose: boolean;
    resolveExtractOptions?: (filePath: string, baseOptions: ExtractOptions) => ExtractOptions;
}
