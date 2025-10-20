import * as path from 'path';

import { createTypeScriptProgram, loadTypeScriptConfig, resolveFiles } from './config';
import { processSourceFiles } from './processor';
import type { BuildOptions } from './types';

// Hardcoded configuration options (previously CLI arguments)
const options: BuildOptions = {
    configPath: path.resolve(process.cwd(), '../../packages/core/tsconfig.json'),
    out: './public/components/generated',
    files: ['../../packages/core/src/components/avatar'],
    externalTypePaths: [
        path.resolve(
            process.cwd(),
            '../../packages/core/node_modules/@base-ui-components/react/esm/index.d.ts',
        ),
    ],
};

/**
 * Main function orchestrating the docs API building process
 */
async function buildDocsApi(): Promise<void> {
    try {
        const { configPath, out: outputPath, files, externalTypePaths } = options;

        // Load TypeScript configuration
        const { config, configDir } = loadTypeScriptConfig(configPath);

        // Resolve file patterns to actual files
        const { resolvedFiles } = await resolveFiles(files, configDir, externalTypePaths);

        // Create TypeScript program and checker
        const { program, checker } = createTypeScriptProgram(resolvedFiles, config);

        // Process source files and generate component data
        await processSourceFiles(resolvedFiles, configDir, program, checker, outputPath);

        console.log('\n✅ Type extraction complete!');
    } catch (error) {
        console.error('❌ Error occurred during type extraction:', error);
        process.exit(1);
    }
}

// Execute the script
buildDocsApi();
