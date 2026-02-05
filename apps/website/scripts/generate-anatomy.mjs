import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CORE_COMPONENTS_PATH = path.resolve(__dirname, '../../../packages/core/src/components');
const OUTPUT_PATH = path.resolve(__dirname, '../public/components/anatomy');

/**
 * @param {string} filePath
 * @returns {{ name: string, fullName: string, isPrimitive: boolean }[]}
 */
function parsePartsFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const parts = [];

    // Match export statements like: ComponentNamePartName as ShortName
    const exportRegex = /(\w+)\s+as\s+(\w+)/g;
    let match;

    while ((match = exportRegex.exec(content)) !== null) {
        const [, internalName, exportedName] = match;
        const isPrimitive = exportedName.endsWith('Primitive');

        parts.push({
            name: exportedName,
            fullName: internalName,
            isPrimitive,
        });
    }

    return parts;
}

/**
 * @param {string} dirPath
 * @returns {string}
 */
function getComponentNameFromPath(dirPath) {
    const dirName = path.basename(dirPath);
    // Convert kebab-case to PascalCase
    return dirName
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');
}

function generateAnatomy() {
    // Ensure output directory exists
    if (!fs.existsSync(OUTPUT_PATH)) {
        fs.mkdirSync(OUTPUT_PATH, { recursive: true });
    }

    // Find all index.parts.ts files
    const componentDirs = fs.readdirSync(CORE_COMPONENTS_PATH, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name);

    let generatedCount = 0;

    for (const dirName of componentDirs) {
        const partsFilePath = path.join(CORE_COMPONENTS_PATH, dirName, 'index.parts.ts');

        if (!fs.existsSync(partsFilePath)) {
            continue;
        }

        const componentName = getComponentNameFromPath(dirName);
        const parts = parsePartsFile(partsFilePath);

        const anatomyData = {
            componentName,
            displayNamePrefix: componentName,
            parts,
        };

        const outputFilePath = path.join(OUTPUT_PATH, `${dirName}.json`);
        fs.writeFileSync(outputFilePath, JSON.stringify(anatomyData, null, 2));

        console.log(`Generated: ${dirName}.json (${parts.length} parts)`);
        generatedCount++;
    }

    console.log(`\nGenerated ${generatedCount} anatomy files.`);
}

generateAnatomy();
