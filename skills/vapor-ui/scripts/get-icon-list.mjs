#!/usr/bin/env node

/**
 * Get list of all Vapor UI icons
 * Usage: node get-icon-list.mjs <version> [search-keyword]
 * Example: node get-icon-list.mjs 1.0.0-beta.12
 * Example: node get-icon-list.mjs 1.0.0-beta.12 arrow
 * Example: node get-icon-list.mjs 1.0.0-beta.12 --outline
 * Example: node get-icon-list.mjs 1.0.0-beta.12 --filled
 */

const version = process.argv[2];
const searchArg = process.argv[3];

if (!version) {
    console.error('ERROR: Version is required');
    console.error('Usage: node get-icon-list.mjs <version> [search-keyword]');
    console.error('');
    console.error('Options:');
    console.error('  --outline    Show only outline icons');
    console.error('  --filled     Show only filled icons');
    console.error('  <keyword>    Filter icons by name (case-insensitive)');
    process.exit(1);
}

const BASE_URL = `https://raw.githubusercontent.com/goorm-dev/vapor-ui/@vapor-ui/icons@${version}`;

async function fetchIndexFile(category) {
    const url = `${BASE_URL}/packages/icons/src/components/${category}/index.ts`;
    const response = await fetch(url);

    if (!response.ok) {
        return null;
    }

    return response.text();
}

function extractIconNames(content) {
    // Pattern: export { default as IconName } from './IconName';
    const exportRegex = /export \{ default as (\w+) \}/g;
    const icons = [];
    let match;

    while ((match = exportRegex.exec(content)) !== null) {
        icons.push(match[1]);
    }

    return icons;
}

function categorizeIcon(name) {
    if (name.endsWith('OutlineIcon')) {
        return { type: 'outline', baseName: name.replace('OutlineIcon', '') };
    }
    return { type: 'filled', baseName: name.replace('Icon', '') };
}

async function getIconList() {
    try {
        console.log(`Fetching icons for @vapor-ui/icons@${version}\n`);

        // Fetch both basic and symbol icons
        const [basicContent, symbolContent] = await Promise.all([
            fetchIndexFile('basic-icons'),
            fetchIndexFile('symbol-icons'),
        ]);

        if (!basicContent && !symbolContent) {
            console.error('ERROR: Could not fetch icon lists. Check version.');
            process.exit(1);
        }

        const basicIcons = basicContent ? extractIconNames(basicContent) : [];
        const symbolIcons = symbolContent ? extractIconNames(symbolContent) : [];

        let allIcons = [
            ...basicIcons.map((name) => ({ name, category: 'basic' })),
            ...symbolIcons.map((name) => ({ name, category: 'symbol' })),
        ];

        // Apply filters
        if (searchArg) {
            if (searchArg === '--outline') {
                allIcons = allIcons.filter((icon) => icon.name.endsWith('OutlineIcon'));
            } else if (searchArg === '--filled') {
                allIcons = allIcons.filter((icon) => !icon.name.endsWith('OutlineIcon'));
            } else {
                const keyword = searchArg.toLowerCase();
                allIcons = allIcons.filter((icon) => icon.name.toLowerCase().includes(keyword));
            }
        }

        // Sort alphabetically
        allIcons.sort((a, b) => a.name.localeCompare(b.name));

        // Group by category
        const basicFiltered = allIcons.filter((i) => i.category === 'basic');
        const symbolFiltered = allIcons.filter((i) => i.category === 'symbol');

        // Output
        if (basicFiltered.length > 0) {
            console.log('## Basic Icons');
            basicFiltered.forEach((icon) => {
                const { type } = categorizeIcon(icon.name);
                const badge = type === 'outline' ? '[outline]' : '[filled]';
                console.log(`  - ${icon.name} ${badge}`);
            });
            console.log(`\n  Subtotal: ${basicFiltered.length}`);
        }

        if (symbolFiltered.length > 0) {
            console.log('\n## Symbol Icons');
            symbolFiltered.forEach((icon) => {
                const { type } = categorizeIcon(icon.name);
                const badge = type === 'outline' ? '[outline]' : '[filled]';
                console.log(`  - ${icon.name} ${badge}`);
            });
            console.log(`\n  Subtotal: ${symbolFiltered.length}`);
        }

        console.log(`\n---\nTOTAL: ${allIcons.length} icons`);

        if (allIcons.length > 0) {
            console.log('\n## Usage Example');
            const sampleIcon = allIcons[0].name;
            console.log(`import { ${sampleIcon} } from '@vapor-ui/icons';`);
            console.log('');
            console.log(`<${sampleIcon} />`);
        }
    } catch (error) {
        console.error(`ERROR: ${error.message}`);
        process.exit(1);
    }
}

getIconList();
