#!/usr/bin/env node

/**
 * Get component information (props, description, etc.)
 * Usage: node get-component-info.mjs <version> <component> [part]
 * Example: node get-component-info.mjs 1.0.0-beta.12 avatar
 * Example: node get-component-info.mjs 1.0.0-beta.12 avatar root
 */

const version = process.argv[2];
const component = process.argv[3];
const specificPart = process.argv[4];

if (!version || !component) {
    console.error('ERROR: Version and component name are required');
    console.error('Usage: node get-component-info.mjs <version> <component> [part]');
    process.exit(1);
}

const BASE_URL = `https://raw.githubusercontent.com/goorm-dev/vapor-ui/@vapor-ui/core@${version}`;
const API_URL = `https://api.github.com/repos/goorm-dev/vapor-ui/contents`;

async function getComponentFolderContents() {
    const url = `${API_URL}/packages/core/src/components/${component}?ref=@vapor-ui/core@${version}`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Component "${component}" not found`);
    }

    return response.json();
}

async function fetchFileContent(path) {
    const url = `${BASE_URL}/${path}`;
    const response = await fetch(url);

    if (!response.ok) {
        return null;
    }

    return response.text();
}

async function fetchComponentJson(partName) {
    const url = `${BASE_URL}/apps/website/public/components/generated/${partName}.json`;
    const response = await fetch(url);

    if (!response.ok) {
        return null;
    }

    return response.json();
}

function extractPartsFromIndexParts(content) {
    // Handle multiline export { ... } from './file';
    const parts = [];

    // Match individual "OriginalName as Alias" patterns anywhere in file
    const namedExportRegex = /(\w+)\s+as\s+(\w+)/g;
    let match;
    while ((match = namedExportRegex.exec(content)) !== null) {
        parts.push({
            original: match[1],
            alias: match[2],
        });
    }

    // Match: export * as Alias from
    const starExportRegex = /export \* as (\w+) from/g;
    while ((match = starExportRegex.exec(content)) !== null) {
        parts.push({
            original: match[1],
            alias: match[1],
        });
    }

    return parts;
}

function extractExportsFromIndex(content) {
    // Extract direct exports from index.ts
    const parts = [];

    // Match: export { ComponentName }
    const exportRegex = /export \{ ([^}]+) \}/g;
    let match;
    while ((match = exportRegex.exec(content)) !== null) {
        const exports = match[1].split(',').map((e) => e.trim());
        exports.forEach((exp) => {
            const [original, alias] = exp.includes(' as ') ? exp.split(' as ').map((s) => s.trim()) : [exp, exp];
            parts.push({ original, alias });
        });
    }

    return parts;
}

function toKebabCase(str) {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

async function getComponentInfo() {
    try {
        console.log(`Fetching info for component: ${component} (v${version})\n`);

        // 1. Get folder contents
        const files = await getComponentFolderContents();
        const fileNames = files.map((f) => f.name);

        console.log(`Files in component folder: ${fileNames.join(', ')}\n`);

        // 2. Determine which file to parse
        let parts = [];
        const hasIndexParts = fileNames.includes('index.parts.ts');

        if (hasIndexParts) {
            const content = await fetchFileContent(`packages/core/src/components/${component}/index.parts.ts`);
            if (content) {
                parts = extractPartsFromIndexParts(content);
            }
        } else {
            const content = await fetchFileContent(`packages/core/src/components/${component}/index.ts`);
            if (content) {
                parts = extractExportsFromIndex(content);
            }
        }

        if (parts.length === 0) {
            console.log('No exportable parts found. Trying direct JSON lookup...\n');
            // Try direct component name
            parts = [{ original: component, alias: component }];
        }

        // Filter by specific part if provided
        if (specificPart) {
            parts = parts.filter((p) => p.alias.toLowerCase() === specificPart.toLowerCase() || p.original.toLowerCase().includes(specificPart.toLowerCase()));
        }

        console.log(`Parts found: ${parts.map((p) => p.alias).join(', ')}\n`);
        console.log('---\n');

        // 3. Fetch JSON info for each part
        for (const part of parts) {
            const partName = toKebabCase(part.original);
            const json = await fetchComponentJson(partName);

            if (json) {
                console.log(`## ${json.displayName || part.alias}`);
                console.log(`Description: ${json.description || 'N/A'}`);
                console.log('\nProps:');

                if (json.props && json.props.length > 0) {
                    json.props.forEach((prop) => {
                        const required = prop.required ? ' (required)' : '';
                        const defaultVal = prop.defaultValue ? ` [default: ${prop.defaultValue}]` : '';
                        const type = Array.isArray(prop.type) ? prop.type.join(' | ') : prop.type;
                        console.log(`  - ${prop.name}${required}: ${type}${defaultVal}`);
                        if (prop.description) {
                            console.log(`    ${prop.description}`);
                        }
                    });
                } else {
                    console.log('  No props documented');
                }

                console.log('\n---\n');
            }
        }
    } catch (error) {
        console.error(`ERROR: ${error.message}`);
        process.exit(1);
    }
}

getComponentInfo();
