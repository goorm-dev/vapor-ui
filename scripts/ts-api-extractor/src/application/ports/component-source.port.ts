export interface FindComponentFilesOptions {
    exclude?: string[];
    skipDefaultExcludes?: boolean;
}

export interface ComponentSourcePort {
    findComponentFiles(inputPath: string, options?: FindComponentFilesOptions): Promise<string[]>;
    findFileByComponentName(files: string[], componentName: string): string | null;
}
