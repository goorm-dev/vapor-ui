import type { ComponentDoc } from '#model';
import { policy } from '#policy';
import { parseSourceFile } from '#read/component-reader';
import { scanComponentFiles } from '#read/scan';
import { type Reporter, silentReporter } from '#reporter';
import path from 'node:path';
import { Project } from 'ts-morph';

export interface ExtractOptions {
    /** Directory scanned for component `.tsx` files. */
    inputPath: string;
    /** tsconfig.json used to resolve types. */
    tsconfigPath: string;
    /** Extract only the component file with this name (`Button`, `button-group`). */
    component?: string;
    /** Defaults to a silent reporter. */
    reporter?: Reporter;
}

function findMissingDocs(docs: ComponentDoc[]): string[] {
    return docs.flatMap((doc) => [
        ...(doc.description ? [] : [doc.name]),
        ...doc.props.filter((prop) => !prop.description).map((prop) => `${doc.name}.${prop.name}`),
    ]);
}

/**
 * Reads the components under `inputPath` and returns their documentation as
 * README "Extraction Policy" specifies. Writes nothing.
 *
 * Throws ExtractorError when `inputPath` or `component` doesn't exist. A file
 * that fails to parse is skipped with a warning, and so is a namespace inside it.
 */
export function extract(options: ExtractOptions): ComponentDoc[] {
    const { reporter = silentReporter } = options;
    const files = scanComponentFiles(options.inputPath, options.component);
    const project = new Project({ tsConfigFilePath: options.tsconfigPath });

    reporter.info('Parsing components...');

    const parsed = files.flatMap((filePath) => {
        const fileName = path.basename(filePath, '.tsx');

        try {
            reporter.info(`Processing ${fileName}`);
            return parseSourceFile(project.addSourceFileAtPath(filePath), reporter);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            reporter.warn(`Failed to extract props for ${fileName}: ${message}`);
            return [];
        }
    });

    const docs = policy(parsed);

    const missingDocs = findMissingDocs(docs);
    if (missingDocs.length > 0) {
        const list = missingDocs.map((name) => `  - ${name}`).join('\n');
        reporter.warn(`Missing JSDoc on ${missingDocs.length} items:\n${list}`);
    }

    reporter.info(`Done! Extracted ${docs.length} components.`);

    return docs;
}
