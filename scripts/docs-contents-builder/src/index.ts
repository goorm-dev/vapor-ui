import { PropItem, parse } from 'react-docgen-typescript';

import { globby } from 'globby';
import * as fs from 'node:fs';
/* eslint-disable prefer-template */
/* eslint-disable no-console */
import * as path from 'node:path';
import ts from 'typescript';
import * as tae from 'typescript-api-extractor';

import { createCliCommand } from './cli';
import { ExportProcessor } from './exportProcessor';
import { FileGenerator } from './fileGenerator';
import { RunOptions, TsConfig } from './types';

const reactDocGenTyepscriptOptions = {
    propFilter: (prop: PropItem) => {
        if (prop.declarations !== undefined && prop.declarations.length > 0) {
            // node_modules에서 온 props 제외 (HTML attributes 포함)[web:83]
            const hasPropAdditionalDescription = prop.declarations.find((declaration) => {
                return !declaration.fileName.includes('node_modules');
            });
            return Boolean(hasPropAdditionalDescription);
        }
        return true;
    },
};
async function run(options: RunOptions) {
    const config = tae.loadConfig(options.configPath);
    const files = await getFilesToProcess(options, config);

    files.map((file) => {
        const ast = parse(file, reactDocGenTyepscriptOptions);
        fs.writeFileSync(
            file.replace(/\.tsx?$/, '.props.json'),
            JSON.stringify(ast, null, 2),
            'utf-8',
        );
    });
}

async function getFilesToProcess(options: RunOptions, config: TsConfig): Promise<string[]> {
    if (options.files && options.files.length > 0) {
        const files = await globby(options.files, {
            cwd: path.dirname(options.configPath),
            absolute: true,
            onlyFiles: true,
        });

        if (files.length === 0) {
            console.error('No files found matching the provided patterns.');
            process.exit(1);
        } else {
            console.log(`Found ${files.length} files to process based on the provided patterns:`);
            files.forEach((file) => console.log(`- ${file}`));
        }

        return files;
    }

    return config.fileNames;
}

// Initialize and run CLI
createCliCommand(run).parse();
