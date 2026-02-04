#!/usr/bin/env node

/**
 * Get component examples
 * Usage: node get-component-examples.mjs <version> <component> [example-name]
 * Example: node get-component-examples.mjs 1.0.0-beta.12 avatar
 * Example: node get-component-examples.mjs 1.0.0-beta.12 avatar default-avatar
 */

const version = process.argv[2];
const component = process.argv[3];
const specificExample = process.argv[4];

if (!version || !component) {
    console.error('ERROR: Version and component name are required');
    console.error('Usage: node get-component-examples.mjs <version> <component> [example-name]');
    process.exit(1);
}

const BASE_URL = `https://raw.githubusercontent.com/goorm-dev/vapor-ui/@vapor-ui/core@${version}`;
const API_URL = `https://api.github.com/repos/goorm-dev/vapor-ui/contents`;

async function getExamplesList() {
    const url = `${API_URL}/apps/website/src/components/demo/examples/${component}?ref=@vapor-ui/core@${version}`;
    const response = await fetch(url);

    if (!response.ok) {
        if (response.status === 404) {
            return [];
        }
        throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
    }

    const files = await response.json();
    return files.filter((f) => f.name.endsWith('.tsx'));
}

async function fetchExampleContent(fileName) {
    const url = `${BASE_URL}/apps/website/src/components/demo/examples/${component}/${fileName}`;
    const response = await fetch(url);

    if (!response.ok) {
        return null;
    }

    return response.text();
}

async function getComponentExamples() {
    try {
        console.log(`Fetching examples for component: ${component} (v${version})\n`);

        // 1. Get list of example files
        let examples = await getExamplesList();

        if (examples.length === 0) {
            console.log('No examples found for this component.');
            return;
        }

        // Filter by specific example if provided
        if (specificExample) {
            examples = examples.filter((e) => e.name.toLowerCase().includes(specificExample.toLowerCase()));
        }

        console.log(`Found ${examples.length} example(s):\n`);

        // 2. List all examples
        examples.forEach((e, i) => {
            console.log(`  ${i + 1}. ${e.name}`);
        });

        console.log('\n---\n');

        // 3. Fetch and display content for each example
        for (const example of examples) {
            const content = await fetchExampleContent(example.name);

            if (content) {
                console.log(`## ${example.name}\n`);
                console.log('```tsx');
                console.log(content);
                console.log('```\n');
                console.log('---\n');
            }
        }
    } catch (error) {
        console.error(`ERROR: ${error.message}`);
        process.exit(1);
    }
}

getComponentExamples();
