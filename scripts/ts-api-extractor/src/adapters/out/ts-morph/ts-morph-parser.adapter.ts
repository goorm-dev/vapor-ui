import { Project } from 'ts-morph';

import { parseSourceFile } from '~/adapters/out/ts-morph/parsers/file-parser';
import type { ExtractOptions } from '~/application/dto/extract-options';
import type { MetadataExtractorPort } from '~/application/ports/metadata-extractor.port';
import type { ParsedComponent } from '~/domain/models/parsed';

export type { ExtractOptions };

export class TsMorphParserAdapter implements MetadataExtractorPort {
    private project: Project | null = null;

    init(tsconfigPath: string): void {
        this.project = new Project({ tsConfigFilePath: tsconfigPath });
    }

    extractFromFile(filePath: string, options: ExtractOptions): ParsedComponent[] {
        if (!this.project) {
            throw new Error('Project is not initialized. Call init(tsconfigPath) first.');
        }

        const sourceFile = this.project.addSourceFileAtPathIfExists(filePath);
        if (!sourceFile) {
            throw new Error(`Source file not found in project: ${filePath}`);
        }

        return parseSourceFile(sourceFile, options);
    }
}
