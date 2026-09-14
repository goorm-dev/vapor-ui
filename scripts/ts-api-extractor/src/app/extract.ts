import path from 'node:path';
import { Project } from 'ts-morph';

import { resolveComponentInclude } from '~/domain/config/resolve';
import type { FilterConfig, ParseConfig } from '~/domain/stage-config';
import type { ExtractInput, ExtractOutput } from '~/domain/output';
import { silentReporter } from '~/domain/reporter';
import { filterParsedComponents } from '~/domain/filter';
import { parseSourceFile } from '~/infrastructure/ts-morph/component-reader';
import { jsonOutputFormat, formatFileName } from '~/domain/output-format';
import { componentsToJson } from '~/domain/serialize';
import { parsedComponentsToModels } from '~/domain/transform';
import { pruneStaleFiles, writeFiles } from '~/infrastructure/fs/file-writer';

export function extract(input: ExtractInput): ExtractOutput {
    const { config, reporter = silentReporter, format = jsonOutputFormat, prune = false } = input;
    const outputDir = path.resolve(process.cwd(), config.outputDir);
    const project = new Project({ tsConfigFilePath: input.tsconfigPath });

    reporter.info('Parsing components...');

    const parsed = input.targetFiles.flatMap((filePath) => {
        const componentName = path.basename(filePath, path.extname(filePath));
        const sourceFile = project.addSourceFileAtPathIfExists(filePath);

        if (!sourceFile) {
            reporter.warn(`Failed to extract props for ${componentName}: source file not found`);
            return [];
        }

        try {
            reporter.info(`Processing ${componentName}`);
            const parseConfig: ParseConfig = { reporter };
            const filterConfig: FilterConfig = {
                filterExternal: config.filterExternal,
                filterHtml: config.filterHtml,
                filterSprinkles: config.filterSprinkles,
                includeHtml: config.includeHtml,
                include: resolveComponentInclude(filePath, config.components),
            };

            const parsedComponents = parseSourceFile(sourceFile, parseConfig);
            return filterParsedComponents(parsedComponents, filterConfig);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            reporter.warn(`Failed to extract props for ${componentName}: ${message}`);
            return [];
        }
    });

    const models = parsedComponentsToModels(parsed);
    const props = componentsToJson(models);

    reporter.info(`Done! Extracted ${props.length} components.`);

    const writtenFiles = writeFiles(
        props.map((prop) => ({
            filePath: path.join(outputDir, formatFileName(prop.name, format)),
            content: format.serialize(prop),
        })),
    );

    if (prune) pruneStaleFiles(outputDir, writtenFiles, format.extension, reporter);

    return {
        parsed,
        models,
        props,
        writtenFiles,
    };
}
