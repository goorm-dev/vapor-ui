#!/usr/bin/env node
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Import the post-processing function from changelog.js
function TitleCase(str) {
    return str
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase())
        .replace(/-/g, ' ');
}

// Function to post-process changelog and group by scope
function postProcessChangelog(changelogContent) {
    const lines = changelogContent.split('\n');
    const groupedEntries = {};
    const otherEntries = [];
    let currentScope = null;
    let currentEntry = '';
    let firstVersionStart = -1;
    let firstVersionEnd = -1;
    let beforeFirstVersion = [];
    let afterFirstVersion = [];

    // Find the first version section bounds
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Find first version header (## 1.0.0, ## 2.1.0, etc.)
        if (line.match(/^## \d+/) && firstVersionStart === -1) {
            firstVersionStart = i;
            continue;
        }

        // Find end of first version section (next ## version or end of file)
        if (firstVersionStart !== -1 && firstVersionEnd === -1) {
            if (line.match(/^## /)) {
                firstVersionEnd = i;
                break;
            }
        }
    }

    // If no version section found, return original content
    if (firstVersionStart === -1) {
        return changelogContent;
    }

    // If no end found, process until end of file
    if (firstVersionEnd === -1) {
        firstVersionEnd = lines.length;
    }

    // Split content into three parts
    beforeFirstVersion = lines.slice(0, firstVersionStart + 1); // Include version header
    const firstVersionContent = lines.slice(firstVersionStart + 1, firstVersionEnd);
    afterFirstVersion = lines.slice(firstVersionEnd);

    // Process only the first version section content
    for (let i = 0; i < firstVersionContent.length; i++) {
        const line = firstVersionContent[i];

        // Skip changeset type headers (### Minor Changes, ### Patch Changes, etc.)
        if (line.match(/^### (Major Changes|Minor Changes|Patch Changes)/)) {
            continue;
        }

        // Skip empty lines after type headers
        if (
            line.trim() === '' &&
            i > 0 &&
            firstVersionContent[i - 1]?.match(/^### (Major Changes|Minor Changes|Patch Changes)/)
        ) {
            continue;
        }

        // Check for scope markers in entries
        const scopeMatch = line.match(/^\[SCOPE:([^\]]+)\]/);
        if (scopeMatch) {
            // Store the previous entry if it exists
            if (currentEntry) {
                if (currentScope) {
                    if (!groupedEntries[currentScope]) {
                        groupedEntries[currentScope] = [];
                    }
                    groupedEntries[currentScope].push(currentEntry);
                } else {
                    otherEntries.push(currentEntry);
                }
            }

            // Start new entry
            // Normalize scope case (first letter uppercase, rest lowercase)
            const rawScope = scopeMatch[1];
            currentScope =
                rawScope === 'Other'
                    ? null
                    : rawScope.charAt(0).toUpperCase() + rawScope.slice(1).toLowerCase();
            // Remove the scope marker from the line
            currentEntry = line.replace(/^\[SCOPE:[^\]]+\]/, '');
            continue;
        }

        // If we're processing a multi-line entry (indented lines)
        if (currentEntry && (line.startsWith('  ') || line.startsWith('\t'))) {
            currentEntry += '\n' + line;
            continue;
        }

        // If we have a complete entry and encounter a new line that doesn't continue it
        if (
            currentEntry &&
            !line.startsWith('  ') &&
            !line.startsWith('\t') &&
            line.trim() !== ''
        ) {
            if (currentScope) {
                if (!groupedEntries[currentScope]) {
                    groupedEntries[currentScope] = [];
                }
                groupedEntries[currentScope].push(currentEntry);
            } else {
                otherEntries.push(currentEntry);
            }
            currentEntry = '';
            currentScope = null;

            // Process the current line again if it's not empty
            if (line.trim() !== '') {
                i--;
                continue;
            }
        }

        // Handle empty lines
        if (line.trim() === '' && currentEntry) {
            // Don't add empty lines to entries
            continue;
        }

        // If it's not a scope marker and not part of an entry, skip it
        if (!line.match(/^\[SCOPE:/) && !currentEntry) {
            continue;
        }
    }

    // Handle the last entry
    if (currentEntry) {
        if (currentScope) {
            if (!groupedEntries[currentScope]) {
                groupedEntries[currentScope] = [];
            }
            groupedEntries[currentScope].push(currentEntry);
        } else {
            otherEntries.push(currentEntry);
        }
    }

    // Generate the result
    let result = beforeFirstVersion.join('\n');

    // Add grouped entries after the version header
    if (Object.keys(groupedEntries).length > 0 || otherEntries.length > 0) {
        result += '\n';

        // Add scoped entries (sorted alphabetically)
        Object.keys(groupedEntries)
            .sort()
            .forEach((scope) => {
                result += `\n### ${TitleCase(scope)}\n\n`;
                groupedEntries[scope].forEach((entry) => {
                    result += entry + '\n\n';
                });
            });

        // Add other entries
        if (otherEntries.length > 0) {
            result += `### Other Changes\n\n`;
            otherEntries.forEach((entry) => {
                result += entry + '\n\n';
            });
        }
    }

    // Add remaining versions (everything after the first version)
    if (afterFirstVersion.length > 0) {
        result += '\n' + afterFirstVersion.join('\n');
    }

    return result.replace(/\n{3,}/g, '\n\n'); // Clean up excessive line breaks
}

// Process a single changelog file
function processChangelogFile(changelogPath, packageName) {
    try {
        const changelogContent = fs.readFileSync(changelogPath, 'utf-8');
        const processedContent = postProcessChangelog(changelogContent);

        // Backup original
        fs.writeFileSync(changelogPath + '.backup', changelogContent);

        // Write processed changelog
        fs.writeFileSync(changelogPath, processedContent);

        console.log(`✅ ${packageName}: Changelog processed and grouped by scope`);
        console.log(`💾 ${packageName}: Original backed up as CHANGELOG.md.backup`);
        return true;
    } catch (error) {
        console.error(`❌ ${packageName}: Error processing changelog - ${error.message}`);
        return false;
    }
}

// Get changed CHANGELOG.md files using git
function getChangedChangelogFiles() {
    try {
        // Get all changed files using git status
        const gitOutput = execSync('git status --porcelain', { encoding: 'utf8' });

        // Filter for CHANGELOG.md files in packages directory
        const changedFiles = gitOutput
            .split('\n')
            .filter((line) => line.trim() !== '')
            .map((line) => line.substring(3).trim()) // Remove git status prefix (e.g., " M ", "??", etc.)
            .filter((file) => file.startsWith('packages/') && file.endsWith('/CHANGELOG.md'));

        return changedFiles;
    } catch (error) {
        console.warn('⚠️  Could not get git status, falling back to processing all changelogs');
        console.warn('   Make sure you are in a git repository and git is installed');
        return null; // Return null to indicate fallback to processing all files
    }
}

// Main execution
function main() {
    const packagesDir = 'packages';

    if (!fs.existsSync(packagesDir)) {
        console.error('packages directory not found');
        process.exit(1);
    }

    let processedCount = 0;
    let errorCount = 0;

    try {
        // Try to get only changed CHANGELOG.md files
        const changedChangelogFiles = getChangedChangelogFiles();

        if (changedChangelogFiles !== null && changedChangelogFiles.length > 0) {
            console.log(`🔍 Found ${changedChangelogFiles.length} changed CHANGELOG.md file(s):`);
            changedChangelogFiles.forEach((file) => console.log(`   📝 ${file}`));
            console.log();

            // Process only changed files
            changedChangelogFiles.forEach((changelogPath) => {
                const packageName = changelogPath.split('/')[1]; // Extract package name from path

                if (fs.existsSync(changelogPath)) {
                    console.log(`📝 Processing ${packageName}/CHANGELOG.md...`);
                    const success = processChangelogFile(changelogPath, packageName);
                    if (success) {
                        processedCount++;
                    } else {
                        errorCount++;
                    }
                } else {
                    console.log(`⚠️  ${changelogPath}: File not found, skipping`);
                }
            });
        } else if (changedChangelogFiles !== null && changedChangelogFiles.length === 0) {
            console.log('ℹ️  No CHANGELOG.md files have been changed');
            console.log('   This is expected if no packages were updated by changesets');
        } else {
            // Fallback: process all CHANGELOG.md files
            console.log('🔄 Fallback: Processing all CHANGELOG.md files...');

            const packageDirs = fs
                .readdirSync(packagesDir, { withFileTypes: true })
                .filter((dirent) => dirent.isDirectory())
                .map((dirent) => dirent.name);

            console.log(`📦 Found ${packageDirs.length} packages to check...`);

            packageDirs.forEach((packageName) => {
                const changelogPath = path.join(packagesDir, packageName, 'CHANGELOG.md');

                if (fs.existsSync(changelogPath)) {
                    console.log(`📝 Processing ${packageName}/CHANGELOG.md...`);
                    const success = processChangelogFile(changelogPath, packageName);
                    if (success) {
                        processedCount++;
                    } else {
                        errorCount++;
                    }
                } else {
                    console.log(`⚠️  ${packageName}: No CHANGELOG.md found, skipping`);
                }
            });
        }

        console.log('\n📊 Summary:');
        console.log(`   ✅ ${processedCount} changelog(s) processed successfully`);
        if (errorCount > 0) {
            console.log(`   ❌ ${errorCount} changelog(s) had errors`);
        }
        if (changedChangelogFiles === null) {
            console.log(`   🔄 Processed all available changelogs (fallback mode)`);
        } else if (changedChangelogFiles.length === 0) {
            console.log(`   ℹ️  No changelogs needed processing`);
        } else {
            console.log(`   🎯 Processed only changed changelogs`);
        }
    } catch (error) {
        console.error('Error processing changelogs:', error.message);
        process.exit(1);
    }
}

main();
