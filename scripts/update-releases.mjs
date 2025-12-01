#!/usr/bin/env node
import { access, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import semver from 'semver';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RELEASES_FILE = path.join(
    __dirname,
    '../apps/website/content/docs/getting-started/releases.md',
);
const PACKAGES_DIR = path.join(__dirname, '../packages');

async function getPackageChangelogs() {
    const packages = (await readdir(PACKAGES_DIR, { withFileTypes: true }))
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name);

    const changelogs = [];

    for (const pkg of packages) {
        const changelogPath = path.join(PACKAGES_DIR, pkg, 'CHANGELOG.md');
        const packageJsonPath = path.join(PACKAGES_DIR, pkg, 'package.json');

        try {
            // Check if both files exist
            await access(changelogPath);
            await access(packageJsonPath);

            const [packageJsonContent, changelogContent] = await Promise.all([
                readFile(packageJsonPath, 'utf8'),
                readFile(changelogPath, 'utf8'),
            ]);

            const packageJson = JSON.parse(packageJsonContent);

            changelogs.push({
                name: packageJson.name,
                path: `packages/${pkg}/CHANGELOG.md`,
                content: changelogContent,
            });
        } catch {
            // Skip packages that don't have both files
            continue;
        }
    }

    return changelogs.sort((a, b) => a.name.localeCompare(b.name));
}

// Parse a Changesets-style CHANGELOG.md into a map of version -> content (string[])
function parseChangelogByVersion(markdown) {
    const lines = markdown.split('\n');
    const versionToContent = new Map();

    // Skip the first header like "# @vapor-ui/core"
    let index = 0;
    while (index < lines.length && !/^##\s+\d+\.\d+\.\d+/.test(lines[index])) {
        index += 1;
    }

    while (index < lines.length) {
        const match = lines[index].match(/^##\s+(\d+\.\d+\.\d+(?:[-+].*)?)/);
        if (!match) {
            index += 1;
            continue;
        }

        const version = match[1];
        index += 1; // move past the version heading

        const contentLines = [];
        while (index < lines.length && !/^##\s+\d+\.\d+\.\d+/.test(lines[index])) {
            contentLines.push(lines[index]);
            index += 1;
        }

        while (contentLines.length > 0 && contentLines[contentLines.length - 1].trim() === '') {
            contentLines.pop();
        }

        versionToContent.set(version, contentLines);
    }

    return versionToContent;
}

function compareSemverDesc(a, b) {
    // Use semver.compare for proper semantic version comparison
    // Returns negative if a < b, 0 if a === b, positive if a > b
    // We want descending order, so reverse the comparison
    return semver.compare(b, a);
}

// Remove empty fenced code blocks (``` ... ``` containing only whitespace)
function stripEmptyCodeFences(lines) {
    const result = [];
    let i = 0;
    while (i < lines.length) {
        const line = lines[i];
        if (/^\s*```/.test(line)) {
            let j = i + 1;
            let hasContent = false;
            while (j < lines.length) {
                if (/^\s*```\s*$/.test(lines[j])) {
                    break;
                }
                if (lines[j].trim() !== '') {
                    hasContent = true;
                }
                j += 1;
            }
            if (j < lines.length && !hasContent) {
                i = j + 1;
                continue;
            }
        }
        result.push(line);
        i += 1;
    }
    return result;
}

export async function updateReleasesFile() {
    const changelogs = await getPackageChangelogs();
    const versionIndex = new Map();

    for (const changelog of changelogs) {
        const versionMap = parseChangelogByVersion(changelog.content);
        for (const [version, contentLines] of versionMap.entries()) {
            if (!versionIndex.has(version)) versionIndex.set(version, []);
            versionIndex.get(version).push({ packageName: changelog.name, contentLines });
        }
    }

    const versions = Array.from(versionIndex.keys()).sort(compareSemverDesc);

    let content =
        `---\n` +
        `title: Releases\n` +
        `description: 각 Vapor UI 릴리스의 Changelogs입니다.\n` +
        `---\n\n`;

    for (const version of versions) {
        content += `## ${version}\n\n`;
        const entries = versionIndex
            .get(version)
            .sort((a, b) => a.packageName.localeCompare(b.packageName));
        for (const { packageName, contentLines } of entries) {
            content += `### ${packageName}\n\n`;
            const demoted = contentLines.map((line) =>
                line.startsWith('### ') ? line.replace(/^### /, '#### ') : line,
            );
            const cleaned = stripEmptyCodeFences(demoted);
            content += cleaned.join('\n').trimEnd() + '\n\n';
        }
        content += '---\n\n';
    }

    await writeFile(RELEASES_FILE, content);
    // eslint-disable-next-line no-console
    console.log(`✅ Updated releases.md grouped by version with ${versions.length} releases`);
}

// Execute when run directly
const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
    try {
        await updateReleasesFile();
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error('❌ Error updating releases.md:', error.message);
        process.exit(1);
    }
}

export default updateReleasesFile;
