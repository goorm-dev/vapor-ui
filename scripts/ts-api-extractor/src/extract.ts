import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { Project } from 'ts-morph';

import { resolveComponentInclude } from '~/config';
import { formatFileName } from '~/filename';
import type { ExtractInput, ExtractOutput, ParseOptions } from '~/models/extract';
import { parseSourceFile } from '~/parse';
import { componentsToJson, parsedComponentsToModels } from '~/transform';
import { buildWriteFiles } from '~/write';

function ensureDirectory(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

function formatWithPrettier(filePaths: string[]): void {
    if (filePaths.length === 0) return;

    try {
        execFileSync('npx', ['prettier', '--write', ...filePaths], { stdio: 'inherit' });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`Prettier formatting skipped: ${message}`);
    }
}

export function extract(input: ExtractInput): ExtractOutput {
    const { config } = input;
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
            const parseOptions: ParseOptions = {
                filterExternal: input.all ? false : config.filterExternal,
                filterHtml: input.all ? false : config.filterHtml,
                filterSprinkles: input.all ? false : config.filterSprinkles,
                includeHtml: config.includeHtml,
                include: resolveComponentInclude(filePath, config),
                verbose: input.verbose,
            };

            return parseSourceFile(sourceFile, parseOptions);
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

    const writeFiles = buildWriteFiles(props, input.outputDir, (prop) => formatFileName(prop.name));

    for (const writeFile of writeFiles) {
        ensureDirectory(path.dirname(writeFile.filePath));
        fs.writeFileSync(writeFile.filePath, writeFile.content);
    }

    const writtenFiles = writeFiles.map((writeFile) => writeFile.filePath);
    formatWithPrettier(writtenFiles);

    return {
        parsed,
        models,
        props,
        writtenFiles,
    };
}
