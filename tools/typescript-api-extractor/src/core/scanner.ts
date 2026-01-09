import { glob } from 'glob';

export async function findComponentFiles(inputPath: string): Promise<string[]> {
    return glob('**/*.tsx', { cwd: inputPath, absolute: true });
}
