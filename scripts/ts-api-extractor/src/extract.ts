import path from 'node:path';
import { Project } from 'ts-morph';

import { resolveComponentInclude } from '~/config/resolve';
import type { ExtractorConfig } from '~/config/schema';
import type { FilterConfig, ParseConfig } from '~/models/config';
import type { PropsInfoJson } from '~/models/output';
import type { ComponentModel, ParsedComponent } from '~/models/pipeline';
import { filterParsedComponents } from '~/stages/filter';
import { parseSourceFile } from '~/stages/parse';
import { componentsToJson } from '~/stages/serialize';
import { parsedComponentsToModels } from '~/stages/transform';
import { writePropsFiles } from '~/stages/write';
import { translatePropsInfo } from '~/translate/pipeline';
import { buildReport, writeReport } from '~/translate/report';
import { formatFileName } from '~/utils/filename';

export interface ExtractInput {
    tsconfigPath: string;
    targetFiles: string[];
    config: ExtractorConfig;
    skipCache?: boolean;
}

export interface ExtractOutput {
    parsed: ParsedComponent[];
    models: ComponentModel[];
    props: PropsInfoJson[];
    writtenFiles: string[];
    translatedProps?: PropsInfoJson[];
}

export async function extract(input: ExtractInput): Promise<ExtractOutput> {
    const { config, skipCache = false } = input;
    const outputDir = path.resolve(process.cwd(), config.outputDir);
    const project = new Project({ tsConfigFilePath: input.tsconfigPath });

    console.error('Parsing components...');

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
            const parseConfig: ParseConfig = {
                verbose: config.verbose,
            };
            const filterConfig: FilterConfig = {
                filterExternal: config.all ? false : config.filterExternal,
                filterHtml: config.all ? false : config.filterHtml,
                filterSprinkles: config.all ? false : config.filterSprinkles,
                includeHtml: config.includeHtml,
                include: resolveComponentInclude(filePath, config),
            };

            const parsedComponents = parseSourceFile(sourceFile, parseConfig);
            return filterParsedComponents(parsedComponents, filterConfig);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.warn(
                `[docs-extractor] Failed to extract props for ${componentName}: ${message}`,
            );
            return [];
        }
    });

    const models = parsedComponentsToModels(parsed);
    const props = componentsToJson(models);

    console.error(`Done! Extracted ${props.length} components.`);

    let translatedProps: PropsInfoJson[] | undefined;
    let writtenFiles: string[];

    if (config.translation?.enabled) {
        // Save original English output to en/ subfolder
        const enFiles = writePropsFiles(
            props,
            outputDir,
            (prop) => formatFileName(prop.name),
            'en',
        );
        // Translate and save to ko/ subfolder (outputDir passed explicitly, no config mutation)
        const translateResult = await translatePropsInfo(
            props,
            config.translation,
            outputDir,
            skipCache,
        );
        translatedProps = translateResult.props;
        writeReport(buildReport(translateResult.componentReports), outputDir);
        const koFiles = writePropsFiles(
            translatedProps,
            outputDir,
            (prop) => formatFileName(prop.name),
            'ko',
        );
        writtenFiles = [...enFiles, ...koFiles];
    } else {
        writtenFiles = writePropsFiles(props, outputDir, (prop) => formatFileName(prop.name));
    }

    return {
        parsed,
        models,
        props,
        writtenFiles,
        translatedProps,
    };
}
