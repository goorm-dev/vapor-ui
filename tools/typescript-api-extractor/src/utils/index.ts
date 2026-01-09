import path from 'node:path';
import fs from 'node:fs';

/**
 * Resolves a path relative to the current working directory
 */
export function resolvePath(filePath: string): string {
  if (path.isAbsolute(filePath)) {
    return filePath;
  }
  return path.resolve(process.cwd(), filePath);
}

/**
 * Checks if a file exists
 */
export function fileExists(filePath: string): boolean {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

/**
 * Reads a JSON file and parses it
 */
export function readJsonFile<T>(filePath: string): T {
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content) as T;
}

/**
 * Writes content to a file, creating directories if necessary
 */
export function writeFile(filePath: string, content: string): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, content, 'utf-8');
}

/**
 * Gets the relative path from the current working directory
 */
export function getRelativePath(absolutePath: string): string {
  return path.relative(process.cwd(), absolutePath);
}

/**
 * Normalizes a file path to use forward slashes
 */
export function normalizePath(filePath: string): string {
  return filePath.replace(/\\/g, '/');
}
