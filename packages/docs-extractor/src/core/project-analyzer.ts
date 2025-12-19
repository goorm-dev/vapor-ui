import type { SourceFile} from 'ts-morph';
import { Project, ts } from 'ts-morph';
import path from 'path';
import type { Logger } from '../utils/logger.js';

/**
 * Manages the ts-morph Project and loads TypeScript source files
 */
export class ProjectAnalyzer {
    private project: Project;
    private logger: Logger;

    constructor(rootPath: string, logger: Logger, tsConfigPath?: string) {
        this.logger = logger;
        const configPath = tsConfigPath || path.join(rootPath, 'packages/core/tsconfig.json');

        this.logger.debug(`Initializing ts-morph Project with tsconfig: ${configPath}`);

        this.project = new Project({
            tsConfigFilePath: configPath,
            skipAddingFilesFromTsConfig: true, // Performance: don't load everything
            compilerOptions: {
                moduleResolution: ts.ModuleResolutionKind.Bundler,
                allowJs: true,
            },
        });
    }

    /**
     * Load source files matching the given patterns
     */
    loadFiles(patterns: string | string[]): SourceFile[] {
        this.logger.debug(`Loading files matching patterns: ${JSON.stringify(patterns)}`);
        const files = this.project.addSourceFilesAtPaths(patterns);
        this.logger.debug(`Loaded ${files.length} files`);
        return files;
    }

    /**
     * Get the TypeScript compiler type checker
     */
    getTypeChecker() {
        return this.project.getTypeChecker().compilerObject;
    }

    /**
     * Get the ts-morph Project instance
     */
    getProject(): Project {
        return this.project;
    }

    /**
     * Get a source file by path
     */
    getSourceFile(filePath: string): SourceFile | undefined {
        return this.project.getSourceFile(filePath);
    }
}
