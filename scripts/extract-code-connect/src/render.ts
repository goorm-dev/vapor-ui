import type { Block, Spec } from './model';

const IDENT = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

const q = (s: string): string => `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
const key = (k: string): string => (IDENT.test(k) ? k : q(k));

export interface RenderInput {
    blocks: Block[];
    /** 입력 URL 그대로. 첫 줄 주석. */
    url: string;
    /** Pascal 컴포넌트 이름. */
    componentName: string;
    kebab: string;
    /** `index.parts.ts` 존재 → `<Pascal.Root>`. */
    hasParts: boolean;
    /** `getProperties` import 지정자. 예: '../../utils/figma-utils' */
    utilsImport: string;
    /** `imports` 문자열의 패키지명. 예: '@vapor-ui/composites' */
    packageImportPath: string;
}

/** Block[] → `.figma.ts` 원문. Prettier 는 호출측에서. */
export function render({
    blocks,
    url,
    componentName,
    kebab,
    hasParts,
    utilsImport,
    packageImportPath,
}: RenderInput): string {
    const rootTag = hasParts ? `${componentName}.Root` : componentName;

    const attrs: string[] = [];
    const children: string[] = [];
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

import { getProperties } from ${q(utilsImport)};

const instance = figma.selectedInstance;

${blocks.map(renderBlock).join('\n\n')}

export default {
    example: figma.code\`
        ${example}
    \`,
    imports: ['import { ${componentName} } from "${packageImportPath}"'],
    id: ${q(kebab)},
    metadata: { nestable: false },
};
`;
}

function renderBlock(block: Block): string {
    const lines = Object.entries(block.entries).map(
        ([k, spec]) => `    ${key(k)}: ${renderSpec(spec)},`,
    );
    for (const name of block.todos) {
        lines.push(`    // TODO: INSTANCE_SWAP ${q(name)} is not supported by getProperties`);
    }
    return `const ${block.varName} = getProperties(instance, ${q(block.instanceName)}, {\n${lines.join('\n')}\n});`;
}

function renderSpec(spec: Spec): string {
    if (spec.kind === 'enum') {
        const options = spec.options.map((o) => `${key(o)}: ${q(o)}`).join(', ');
        return `{ kind: 'enum', name: ${q(spec.name)}, options: { ${options} } }`;
    }
    return `{ kind: ${q(spec.kind)}, name: ${q(spec.name)} }`;
}
