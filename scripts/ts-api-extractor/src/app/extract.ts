import { filterParsedComponents } from '#domain/filter';
import type { ExtractInput, ExtractOutput, PropsInfoJson } from '#domain/output';
import { formatFileName, jsonOutputFormat } from '#domain/output-format';
import { silentReporter } from '#domain/reporter';
import { componentsToJson } from '#domain/serialize';
import type { FilterConfig, ParseConfig } from '#domain/stage-config';
import { parsedComponentsToModels } from '#domain/transform';
import { removeStaleFiles, writeFiles } from '#infrastructure/fs/file-writer';
import { parseSourceFile } from '#infrastructure/ts-morph/component-reader';
import path from 'node:path';
import { Project } from 'ts-morph';

function findMissingDocs(components: PropsInfoJson[]): string[] {
    return components.flatMap((component) => [
        ...(component.description ? [] : [component.name]),
        ...component.props
            .filter((prop) => !prop.description)
            .map((prop) => `${component.name}.${prop.name}`),
    ]);
}

/** The prop policy from README "Props". Fixed in code so every run documents the same way. */
const FILTER_CONFIG: FilterConfig = {
    filterExternal: true,
    filterHtml: true,
    filterSprinkles: true,
    includeHtml: ['className', 'style'],
};

export function extract(input: ExtractInput): ExtractOutput {
    const { reporter = silentReporter, format = jsonOutputFormat } = input;
    const outputDir = path.resolve(input.outputDir);
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
            const parsedComponents = parseSourceFile(sourceFile, parseConfig);
            return filterParsedComponents(parsedComponents, FILTER_CONFIG);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            reporter.warn(`Failed to extract props for ${componentName}: ${message}`);
            return [];
        }
    });

    const models = parsedComponentsToModels(parsed);
    const props = componentsToJson(models);

    const missingDocs = findMissingDocs(props);
    if (missingDocs.length > 0) {
        const list = missingDocs.map((name) => `  - ${name}`).join('\n');
        reporter.warn(`Missing JSDoc on ${missingDocs.length} items:\n${list}`);
    }

    reporter.info(`Done! Extracted ${props.length} components.`);

    const writtenFiles = writeFiles(
        props.map((prop) => ({
            filePath: path.join(outputDir, formatFileName(prop.name, format)),
            content: format.serialize(prop),
        })),
    );

    if (input.removeStale) {
        const removed = removeStaleFiles(outputDir, writtenFiles);
        if (removed.length > 0) reporter.info(`Removed ${removed.length} stale files.`);
    }

    return {
        parsed,
        models,
        props,
        writtenFiles,
    };
}
