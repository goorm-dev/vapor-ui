const IDENT = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

const q = (s) => `'${String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
const key = (k) => (IDENT.test(k) ? k : q(k));

/**
 * Block[] → `.figma.ts` 원문. Prettier 는 호출측에서.
 *
 * @param {{
 *   blocks: import('./model.mjs').Block[],
 *   url: string,
 *   componentName: string,
 *   kebab: string,
 *   hasParts: boolean,
 * }} input
 * @returns {string}
 */
export function render({ blocks, url, componentName, kebab, hasParts }) {
    const rootTag = hasParts ? `${componentName}.Root` : componentName;

    const attrs = [];
    const children = [];
    for (const block of blocks) {
        for (const [k, spec] of Object.entries(block.entries)) {
            (spec.kind === 'slot' ? children : attrs).push(`\${${block.varName}.${k}}`);
        }
    }

    const openTag = `<${rootTag}\n${attrs.map((a) => `            ${a}`).join('\n')}\n        `;
    const example =
        children.length === 0
            ? `${openTag}/>`
            : `${openTag}>\n${children.map((c) => `            ${c}`).join('\n')}\n        </${rootTag}>`;

    return `// url=${url}
// source=src/components/${kebab}/${kebab}.tsx
// component=${componentName}
import figma from 'figma';

import { getProperties } from '../../utils/figma-utils';

const instance = figma.selectedInstance;

${blocks.map(renderBlock).join('\n\n')}

export default {
    example: figma.code\`
        ${example}
    \`,
    imports: ['import { ${componentName} } from "@vapor-ui/composites"'],
    id: ${q(kebab)},
    metadata: { nestable: false },
};
`;
}

/** @param {import('./model.mjs').Block} block */
function renderBlock(block) {
    const lines = Object.entries(block.entries).map(
        ([k, spec]) => `    ${key(k)}: ${renderSpec(spec)},`,
    );
    for (const name of block.todos) {
        lines.push(`    // TODO: INSTANCE_SWAP ${q(name)} is not supported by getProperties`);
    }
    return `const ${block.varName} = getProperties(instance, ${q(block.instanceName)}, {\n${lines.join('\n')}\n});`;
}

/** @param {import('./model.mjs').Spec} spec */
function renderSpec(spec) {
    if (spec.kind === 'enum') {
        const options = spec.options.map((o) => `${key(o)}: ${q(o)}`).join(', ');
        return `{ kind: 'enum', name: ${q(spec.name)}, options: { ${options} } }`;
    }
    return `{ kind: ${q(spec.kind)}, name: ${q(spec.name)} }`;
}
