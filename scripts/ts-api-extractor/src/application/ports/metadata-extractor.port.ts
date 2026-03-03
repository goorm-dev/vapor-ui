import type { ExtractOptions } from '~/application/dto/extract-options';
import type { ParsedComponent } from '~/domain/models/parsed';

export interface MetadataExtractorPort {
    init(tsconfigPath: string): void;
    extractFromFile(filePath: string, options: ExtractOptions): ParsedComponent[];
}
