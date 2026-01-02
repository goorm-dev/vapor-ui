/**
 * File Writer - handles writing output files to disk
 */
import fs from 'fs/promises';
import path from 'path';

import type { Logger } from '../utils/logger';

/**
 * File Writer class
 */
export class FileWriter {
    constructor(private logger: Logger) {}

    /**
     * Write JSON content to a file
     */
    async writeJson(filePath: string, content: unknown): Promise<void> {
        const json = JSON.stringify(content, null, 2);
        await this.writeFile(filePath, json);
    }

    /**
     * Write string content to a file
     */
    async writeFile(filePath: string, content: string): Promise<void> {
        const dir = path.dirname(filePath);

        // Ensure directory exists
        await fs.mkdir(dir, { recursive: true });

        // Write file
        await fs.writeFile(filePath, content, 'utf-8');
        this.logger.debug(`Wrote ${filePath}`);
    }

    /**
     * Ensure a directory exists
     */
    async ensureDirectory(dirPath: string): Promise<void> {
        await fs.mkdir(dirPath, { recursive: true });
    }

    /**
     * Check if a file exists
     */
    async exists(filePath: string): Promise<boolean> {
        try {
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Delete a file if it exists
     */
    async deleteIfExists(filePath: string): Promise<boolean> {
        try {
            await fs.unlink(filePath);
            this.logger.debug(`Deleted ${filePath}`);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Clean a directory (delete all contents)
     */
    async cleanDirectory(dirPath: string): Promise<void> {
        try {
            await fs.rm(dirPath, { recursive: true, force: true });
            await fs.mkdir(dirPath, { recursive: true });
            this.logger.debug(`Cleaned directory ${dirPath}`);
        } catch (error) {
            this.logger.warn(`Failed to clean directory ${dirPath}: ${error}`);
        }
    }
}
