import fs from 'fs';
import { fileURLToPath } from 'node:url';
import path from 'path';

// const fs = require('fs');
// const path = require('path');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WORKSPACE_ROOT = path.resolve(__dirname, '../../');
const PACKAGES_DIR = path.join(WORKSPACE_ROOT, 'packages');
const TARGET_DIR = path.join(WORKSPACE_ROOT, 'apps/website/content/docs/getting-started/releases');

function getDirectories(srcPath) {
    if (!fs.existsSync(srcPath)) return [];

    return fs
        .readdirSync(srcPath)
        .filter((file) => fs.statSync(path.join(srcPath, file)).isDirectory());
}

function processDirectory(baseDir) {
    const dirs = getDirectories(baseDir);

    dirs.forEach((dir) => {
        const packagePath = path.join(baseDir, dir);
        const packageJsonPath = path.join(packagePath, 'package.json');
        const changelogPath = path.join(packagePath, 'CHANGELOG.md');

        if (!fs.existsSync(packageJsonPath) || !fs.existsSync(changelogPath)) {
            return;
        }

        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        const packageName = packageJson.name;

        // Determine target file name
        // Remove scope if present (e.g. @vapor-ui/core -> core)
        const cleanName = packageName.replace(/^@vapor-ui\//, '');
        const targetFileName = `${cleanName}.md`;
        const targetFilePath = path.join(TARGET_DIR, targetFileName);

        if (!fs.existsSync(targetFilePath)) {
            console.log(`Skipping ${packageName}: Target file ${targetFileName} not found.`);
            return;
        }

        const newReleaseNote = fs.readFileSync(changelogPath, 'utf8');
        const targetContent = fs.readFileSync(targetFilePath, 'utf8');

        // Extract frontmatter
        const frontmatterMatch = targetContent.match(/^---\n([\s\S]*?)\n---\n/);

        if (!frontmatterMatch) {
            console.warn(
                `Warning: No frontmatter found in ${targetFileName}. Overwriting completely.`,
            );

            fs.writeFileSync(targetFilePath, newReleaseNote);
            return;
        }

        const frontmatter = frontmatterMatch[0];
        // Ensure there is a newline after frontmatter before content
        const newContent = `${frontmatter}\n${newReleaseNote}`;

        fs.writeFileSync(targetFilePath, newContent);
        console.log(`✅ ${packageName}`);
    });
}

processDirectory(PACKAGES_DIR);
