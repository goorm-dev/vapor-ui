/**
 * DeepL glossary creation script
 * Creates a glossary to keep technical terms in English.
 *
 * Usage:
 *   DEEPL_API_KEY=xxx pnpm create-glossary
 *
 * Set the created glossary_id in the DEEPL_GLOSSARY_ID environment variable.
 */
import { KEEP_ENGLISH_TERMS } from '../constants/index.js';

const DEEPL_API_BASE = process.env.DEEPL_API_KEY?.endsWith(':fx')
    ? 'https://api-free.deepl.com'
    : 'https://api.deepl.com';

export async function createGlossary() {
    const apiKey = process.env.DEEPL_API_KEY;
    if (!apiKey) {
        console.error('Error: DEEPL_API_KEY environment variable is not set');
        process.exit(1);
    }

    // TSV format: source\ttarget (English -> keep English)
    const entries = KEEP_ENGLISH_TERMS.map((term) => `${term}\t${term}`).join('\n');

    console.log('Creating glossary with entries:');
    console.log(`  Total terms: ${KEEP_ENGLISH_TERMS.length}`);
    console.log(`  Sample: ${KEEP_ENGLISH_TERMS.slice(0, 5).join(', ')}...`);

    const response = await fetch(`${DEEPL_API_BASE}/v2/glossaries`, {
        method: 'POST',
        headers: {
            Authorization: `DeepL-Auth-Key ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: 'vapor-ui-technical-terms',
            source_lang: 'EN',
            target_lang: 'KO',
            entries,
            entries_format: 'tsv',
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to create glossary: ${response.status}`);
        console.error(errorText);
        process.exit(1);
    }

    const glossary = (await response.json()) as {
        glossary_id: string;
        name: string;
        entry_count: number;
    };

    console.log('\n✓ Glossary created successfully!');
    console.log(`  ID: ${glossary.glossary_id}`);
    console.log(`  Name: ${glossary.name}`);
    console.log(`  Entries: ${glossary.entry_count}`);
    console.log('\nAdd this to your environment:');
    console.log(`  export DEEPL_GLOSSARY_ID=${glossary.glossary_id}`);
}
