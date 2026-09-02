// @vitest-environment node
import prettier from 'prettier';
import { describe, expect, it } from 'vitest';

import { render } from '../render.mjs';

const fmt = (code) =>
    prettier.format(code, {
        parser: 'typescript',
        singleQuote: true,
        tabWidth: 4,
        printWidth: 100,
    });

const dialogBlocks = [
    {
        varName: 'popup',
        instanceName: '(Popup)',
        entries: { size: { kind: 'enum', name: 'size', options: ['md', 'lg', 'xl'] } },
        todos: [],
    },
    {
        varName: 'header',
        instanceName: '(Header)',
        entries: {
            title: { kind: 'string', name: 'title' },
            description: { kind: 'string', name: 'description' },
        },
        todos: [],
    },
    {
        varName: 'body',
        instanceName: '(Body)',
        entries: { children: { kind: 'slot', name: '(content)' } },
        todos: [],
    },
    {
        varName: 'footer',
        instanceName: '(Footer)',
        entries: {
            assistive: { kind: 'instance', name: 'Assistive' },
            action: { kind: 'instance', name: 'Action' },
        },
        todos: [],
    },
];

const url = 'https://www.figma.com/design/he4tiAGOKGPl0Fm56ZpJsy/X?node-id=2337-38499&m=dev';

describe('render', () => {
    it('Dialog 블록을 현재 dialog.figma.ts 와 동치인 템플릿으로 렌더한다', async () => {
        const out = await fmt(
            render({
                blocks: dialogBlocks,
                url,
                componentName: 'Dialog',
                kebab: 'dialog',
                hasParts: true,
            }),
        );

        const expected = await fmt(`
// url=${url}
// source=src/components/dialog/dialog.tsx
// component=Dialog
import figma from 'figma';

import { getProperties } from '../../utils/figma-utils';

const instance = figma.selectedInstance;

const popup = getProperties(instance, '(Popup)', {
    size: { kind: 'enum', name: 'size', options: { md: 'md', lg: 'lg', xl: 'xl' } },
});

const header = getProperties(instance, '(Header)', {
    title: { kind: 'string', name: 'title' },
    description: { kind: 'string', name: 'description' },
});

const body = getProperties(instance, '(Body)', {
    children: { kind: 'slot', name: '(content)' },
});

const footer = getProperties(instance, '(Footer)', {
    assistive: { kind: 'instance', name: 'Assistive' },
    action: { kind: 'instance', name: 'Action' },
});

export default {
    example: figma.code\`
        <Dialog.Root
            \${popup.size}
            \${header.title}
            \${header.description}
            \${footer.assistive}
            \${footer.action}
        >
            \${body.children}
        </Dialog.Root>
    \`,
    imports: ['import { Dialog } from "@vapor-ui/composites"'],
    id: 'dialog',
    metadata: { nestable: false },
};
`);
        expect(out).toBe(expected);
    });

    it('index.parts.ts 가 없으면 flat 이름, slot 이 없으면 self-closing', async () => {
        const blocks = [
            {
                varName: 'root',
                instanceName: '(Root)',
                entries: { label: { kind: 'string', name: 'label' } },
                todos: [],
            },
        ];
        const out = await fmt(
            render({ blocks, url, componentName: 'Badge', kebab: 'badge', hasParts: false }),
        );
        expect(out).toContain('<Badge');
        expect(out).not.toContain('Badge.Root');
        expect(out).toMatch(/\$\{root\.label\}\s*\/>/);
        expect(out).toContain('import { Badge } from "@vapor-ui/composites"');
        expect(out).toContain("id: 'badge'");
    });

    it('INSTANCE_SWAP todo 는 블록 안 주석으로 남는다', async () => {
        const blocks = [{ varName: 'slot', instanceName: '(Slot)', entries: {}, todos: ['Icon'] }];
        const out = await fmt(
            render({ blocks, url, componentName: 'X', kebab: 'x', hasParts: false }),
        );
        expect(out).toContain("// TODO: INSTANCE_SWAP 'Icon' is not supported by getProperties");
    });

    it('식별자가 아닌 enum 옵션은 key 를 인용한다', async () => {
        const blocks = [
            {
                varName: 'p',
                instanceName: '(P)',
                entries: { v: { kind: 'enum', name: 'v', options: ['x-large', 'md'] } },
                todos: [],
            },
        ];
        const out = await fmt(
            render({ blocks, url, componentName: 'X', kebab: 'x', hasParts: false }),
        );
        expect(out).toContain("'x-large': 'x-large', md: 'md'");
    });
});
