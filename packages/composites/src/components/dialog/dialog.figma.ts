// url=https://www.figma.com/design/he4tiAGOKGPl0Fm56ZpJsy/-Composites--Vapor-Design-System?node-id=2328-28106&t=xH7e3KuAX2DRDDhM-11
// source=src/components/dialog/dialog.tsx
// component=Dialog
import figma from 'figma';

// NOTE: Code Connect CLI ignores tsconfig.paths (esbuild tsconfigRaw: '{}').
// Aliases like `~/utils/*` will not resolve — use relative paths only.
import { getProperties } from '../../utils/figma-utils';

const instance = figma.selectedInstance;

const size = instance.getEnum('size', { md: 'md', lg: 'lg', xl: 'xl' });

const header = getProperties(instance, '(Header)', {
    title: { kind: 'string', name: 'Title' },
    description: { kind: 'string', name: 'Description' },
    hasDescription: { kind: 'boolean', name: '(Has description)' },
});

const body = getProperties(instance, '(Body)', {
    children: { kind: 'slot', name: '(Content)' },
});

const footer = getProperties(instance, '(Footer)', {
    hasFooter: {
        kind: 'enum',
        name: '(Has footer)',
        options: { true: true, false: false },
    },
    hasAssistive: { kind: 'boolean', name: '(Has assistive)' },
    action: { kind: 'instance', name: 'Action' },
    assistive: { kind: 'instance', name: 'Assistive' },
});

export default {
    example: figma.code`
        <Dialog.Root
            size="${size}"
            title="${header.title}"
            ${header.hasDescription ? figma.code`description="${header.description}"` : ''}
            ${footer.hasFooter ? figma.code`action={${footer.action}}` : ''}
            ${footer.hasFooter && footer.hasAssistive ? figma.code`assistive={${footer.assistive}}` : ''}
        >
            ${body.children}
        </Dialog.Root>
    `,
    imports: ['import { Dialog } from "@vapor-ui/composites"'],
    id: 'dialog',
    metadata: { nestable: true },
};
