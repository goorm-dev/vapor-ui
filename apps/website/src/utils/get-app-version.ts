import { readFile } from 'fs/promises';
import path from 'path';

const rootDir = process.cwd();

export async function getAppVersion() {
    try {
        const packagePath = path.resolve(rootDir, 'package.json');

        const data = await readFile(packagePath, 'utf-8');
        const pkg = JSON.parse(data);

        return pkg.version;
    } catch (error) {
        console.error('Failed to read package.json:', error);
        return '0.0.0';
    }
}
