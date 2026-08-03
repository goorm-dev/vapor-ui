import path from 'node:path';
import { Project } from 'ts-morph';

import type { FilterConfig } from '~/models/config';
import type { ExtractInput } from '~/models/output';
import { filterParsedComponents } from '~/stages/filter';
import { parseSourceFile } from '~/stages/parse';
import { componentsToJson } from '~/stages/serialize';
import { parsedComponentsToModels } from '~/stages/transform';
import { writePropsFiles } from '~/stages/write';
import { formatFileName } from '~/utils/filename';

export function extract(input: ExtractInput): string[] {
    const { config } = input;
    const outputDir = path.resolve(process.cwd(), config.outputDir);
    const project = new Project({ tsConfigFilePath: input.tsconfigPath });

    console.error('Parsing components...');

    const filterConfig: FilterConfig = {
        filterExternal: config.filterExternal,
        filterHtml: config.filterHtml,
        filterSprinkles: config.filterSprinkles,
        includeHtml: config.includeHtml,
    };

    const parsed = input.targetFiles.flatMap((filePath) => {
        const componentName = path.basename(filePath, path.extname(filePath));
        const sourceFile = project.addSourceFileAtPathIfExists(filePath);

        if (!sourceFile) {
            console.warn(
                `[docs-extractor] Failed to extract props for ${componentName}: source file not found`,
            );
            return [];
        }

        try {
            console.error(`Processing ${componentName}`);
            return filterParsedComponents(parseSourceFile(sourceFile), filterConfig);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.warn(
                `[docs-extractor] Failed to extract props for ${componentName}: ${message}`,
            );
            return [];
        }
    });

    const props = componentsToJson(parsedComponentsToModels(parsed));

    console.error(`Done! Extracted ${props.length} components.`);

    return writePropsFiles(props, path.join(outputDir, 'en'), (prop) => formatFileName(prop.name));
}
