import * as fs from 'fs';
import * as path from 'path';
import { format, resolveConfig } from 'prettier';
import { fileURLToPath } from 'url';

import { CONFIG } from '../constants/index.js';
import { getAllFiles, getChangedFiles } from '../lib/git.js';
import { applyTranslation, translateBatch } from '../lib/translator.js';
import type { PropsInfo } from '../types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function translate() {
    const args = process.argv.slice(2);
    const isAll = args.includes('--all');
    const isChanged = args.includes('--changed') || !isAll;

    // Check DeepL API key
    const apiKey = process.env.DEEPL_API_KEY;
    if (!apiKey) {
        console.error('Error: DEEPL_API_KEY environment variable is not set');
        process.exit(1);
    }

    // Optional: Glossary ID for preserving technical terms
    const glossaryId = process.env.DEEPL_GLOSSARY_ID;
    if (glossaryId) {
        console.log(`Using glossary: ${glossaryId}`);
    } else {
        console.log('No glossary ID set. Technical terms may be translated.');
        console.log('Run `pnpm create-glossary` to create one.');
    }

    // Files to translate
    const files = isChanged ? getChangedFiles() : getAllFiles();

    if (files.length === 0) {
        console.log('No files to translate');
        return;
    }

    console.log(`\nFiles to translate (${files.length}):`);
    files.map((f) => console.log(`  - ${f}`));

    const sourceDir = path.resolve(__dirname, '..', CONFIG.sourceDir);
    const targetDir = path.resolve(__dirname, '..', CONFIG.targetDir);

    // Create target directory
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }

    console.log(`\nStarting translation...\n`);

    let successCount = 0;
    let errorCount = 0;

    for (const file of files) {
        const sourcePath = path.join(sourceDir, file);
        const targetPath = path.join(targetDir, file);

        console.log(`Processing: ${file}`);

        try {
            // Read source file
            const sourceContent = fs.readFileSync(sourcePath, 'utf-8');
            const propsInfo: PropsInfo = JSON.parse(sourceContent);

            // Translate (single API call for all descriptions, excluding common props)
            console.log(`    Translating ${propsInfo.props.length} props...`);
            const translation = await translateBatch(apiKey, propsInfo, glossaryId);

            // Apply translation
            const translated = applyTranslation(propsInfo, translation);

            // Save result (formatted with prettier config)
            const jsonContent = JSON.stringify(translated, null, 2);
            const prettierOptions = (await resolveConfig(targetPath)) ?? {};
            const formatted = await format(jsonContent, {
                ...prettierOptions,
                parser: 'json',
            });
            fs.writeFileSync(targetPath, formatted);

            console.log(`  ✓ Saved to ${targetPath}\n`);
            successCount++;
        } catch (error) {
            console.error(`  ✗ Error: ${error}\n`);
            errorCount++;
        }
    }

    console.log(`\n========================================`);
    console.log(`Translation complete!`);
    console.log(`  Success: ${successCount}`);
    console.log(`  Errors: ${errorCount}`);
    console.log(`========================================\n`);
}
