import { toKebabCase } from '~/domain/file-name';
import type { PropsInfoJson } from '~/domain/output';

/**
 * How one extracted component becomes one file on disk. Adding a format means
 * adding an entry here and selecting it — the writer stays untouched.
 */
export interface OutputFormat {
    name: string;
    extension: string;
    serialize(data: PropsInfoJson): string;
}

export const jsonOutputFormat: OutputFormat = {
    name: 'json',
    extension: '.json',
    serialize: (data) => JSON.stringify(data, null, 2),
};

export function formatFileName(componentName: string, format: OutputFormat): string {
    return `${toKebabCase(componentName)}${format.extension}`;
}
