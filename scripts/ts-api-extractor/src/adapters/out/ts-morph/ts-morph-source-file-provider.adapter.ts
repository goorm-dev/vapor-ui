import {
    findComponentFiles,
    findFileByComponentName,
} from '~/adapters/out/ts-morph/parsers/component/scanner';
import type {
    ComponentSourcePort,
    FindComponentFilesOptions,
} from '~/application/ports/component-source.port';

export class TsMorphSourceFileProviderAdapter implements ComponentSourcePort {
    findComponentFiles(inputPath: string, options?: FindComponentFilesOptions): Promise<string[]> {
        return findComponentFiles(inputPath, options);
    }

    findFileByComponentName(files: string[], componentName: string): string | null {
        return findFileByComponentName(files, componentName);
    }
}
