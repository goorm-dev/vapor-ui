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

export interface ExtractResult {
    docs: ComponentDoc[];
    /** Files or namespaces that failed to parse. They are missing from `docs`. */
    failures: string[];
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
 * that fails to parse is skipped with a warning and listed in `failures`, and so
 * is a namespace inside it.
 */
export function extract(options: ExtractOptions): ExtractResult {
    const { reporter = silentReporter } = options;
    const files = scanComponentFiles(options.inputPath, options.component);
    const project = new Project({ tsConfigFilePath: options.tsconfigPath });

    reporter.info('Parsing components...');

    const failures: string[] = [];
    const parsed = files.flatMap((filePath) => {
        const fileName = path.basename(filePath, '.tsx');

        try {
            reporter.info(`Processing ${fileName}`);
            const result = parseSourceFile(project.addSourceFileAtPath(filePath), reporter);
            failures.push(...result.failures);
            return result.components;
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            reporter.warn(`Failed to extract props for ${fileName}: ${message}`);
            failures.push(fileName);
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

    return { docs, failures };
}
