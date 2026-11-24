#!/usr/bin/env node

/**
 * Get list of all Vapor UI components
 * Usage: node get-component-list.mjs <version>
 * Example: node get-component-list.mjs 1.0.0-beta.12
 */

const version = process.argv[2];

if (!version) {
    console.error('ERROR: Version is required');
    console.error('Usage: node get-component-list.mjs <version>');
    process.exit(1);
}

const BASE_URL = `https://raw.githubusercontent.com/goorm-dev/vapor-ui/@vapor-ui/core@${version}`;
const INDEX_URL = `${BASE_URL}/packages/core/src/index.ts`;

async function getComponentList() {
    try {
        const response = await fetch(INDEX_URL);

        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
        }

        const content = await response.text();

        // Extract component names from export statements
        // Pattern: export * from './components/avatar';
        const exportRegex = /export \* from ['"]\.\/components\/([^'"]+)['"]/g;
        const components = [];
        let match;

        while ((match = exportRegex.exec(content)) !== null) {
            components.push(match[1]);
        }

        if (components.length === 0) {
            console.error('ERROR: No components found');
            process.exit(1);
        }

        console.log('COMPONENTS:');
        components.forEach((component) => console.log(`  - ${component}`));
        console.log(`\nTOTAL: ${components.length}`);
    } catch (error) {
        console.error(`ERROR: ${error.message}`);
        process.exit(1);
    }
}

getComponentList();
