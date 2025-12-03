import fs from 'fs';
import path from 'path';

describe('@vapor-ui/core', () => {
    it('should export all components from the components directory', async () => {
        const componentsDir = path.join(__dirname, 'components');

        // Get all component folder names (excluding _internal and .DS_Store)
        const componentFolders = fs
            .readdirSync(componentsDir, { withFileTypes: true })
            .filter((dirent) => dirent.isDirectory() && !dirent.name.startsWith('_'))
            .map((dirent) => dirent.name);

        // Read index.ts to check exports
        const indexContent = fs.readFileSync(path.join(__dirname, 'index.ts'), 'utf-8');

        const missingExports: string[] = [];

        componentFolders.forEach((folder) => {
            const exportPattern = `export * from './components/${folder}'`;
            if (!indexContent.includes(exportPattern)) {
                missingExports.push(folder);
            }
        });

        expect(missingExports).toEqual([]);
    });
});
