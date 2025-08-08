#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const RELEASES_FILE = path.join(
    __dirname,
    '../apps/website/content/docs/getting-started/releases.md',
);
const PACKAGES_DIR = path.join(__dirname, '../packages');

function getPackageChangelogs() {
    const packages = fs
        .readdirSync(PACKAGES_DIR, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name);

    const changelogs = [];

    for (const pkg of packages) {
        const changelogPath = path.join(PACKAGES_DIR, pkg, 'CHANGELOG.md');
        const packageJsonPath = path.join(PACKAGES_DIR, pkg, 'package.json');

        if (fs.existsSync(changelogPath) && fs.existsSync(packageJsonPath)) {
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
            const changelog = fs.readFileSync(changelogPath, 'utf8');

            changelogs.push({
                name: packageJson.name,
                path: `packages/${pkg}/CHANGELOG.md`,
                content: changelog,
            });
        }
    }

    return changelogs.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Parse a Changesets-style CHANGELOG.md into a map of version -> content (string[])
 * The content for each version excludes the "## {version}" heading line.
 */
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

        // Trim trailing blank lines
        while (contentLines.length > 0 && contentLines[contentLines.length - 1].trim() === '') {
            contentLines.pop();
        }

        versionToContent.set(version, contentLines);
    }

    return versionToContent;
}

function compareSemverDesc(a, b) {
    // Compare b vs a for descending order
    const pa = a.split(/[.-]/).map(Number);
    const pb = b.split(/[.-]/).map(Number);
    for (let i = 0; i < Math.max(pa.length, pb.length); i += 1) {
        const na = Number.isFinite(pa[i]) ? pa[i] : 0;
        const nb = Number.isFinite(pb[i]) ? pb[i] : 0;
        if (na !== nb) return nb - na;
    }
    return 0;
}

function updateReleasesFile() {
    const changelogs = getPackageChangelogs();
    // Build an index of version -> [{ packageName, contentLines }]
    const versionIndex = new Map();

    for (const changelog of changelogs) {
        const versionMap = parseChangelogByVersion(changelog.content);
        for (const [version, contentLines] of versionMap.entries()) {
            if (!versionIndex.has(version)) versionIndex.set(version, []);
            versionIndex.get(version).push({
                packageName: changelog.name,
                contentLines,
            });
        }
    }

    // Sort versions in descending semver order
    const versions = Array.from(versionIndex.keys()).sort(compareSemverDesc);

    let content = `---
title: Releases
description: 각 Vapor UI 릴리스의 Chanagelogs입니다.
---

`;

    for (const version of versions) {
        content += `## ${version}\n\n`;

        // Sort packages by name for stable output
        const entries = versionIndex
            .get(version)
            .sort((a, b) => a.packageName.localeCompare(b.packageName));
        for (const { packageName, contentLines } of entries) {
            content += `### ${packageName}\n\n`;
            // Demote any H3 headings inside package content to H4 to keep hierarchy under package
            const transformed = contentLines
                .map((line) => (line.startsWith('### ') ? line.replace(/^### /, '#### ') : line))
                .join('\n');
            content += transformed.trimEnd() + '\n\n';
        }

        content += '---\n\n';
    }

    fs.writeFileSync(RELEASES_FILE, content);
    console.log(`✅ Updated releases.md grouped by version with ${versions.length} releases`);
}

// Check if running as main script
if (require.main === module) {
    try {
        updateReleasesFile();
    } catch (error) {
        console.error('❌ Error updating releases.md:', error.message);
        process.exit(1);
    }
}

module.exports = { updateReleasesFile, getPackageChangelogs };
