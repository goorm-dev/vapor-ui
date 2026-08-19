// url=https://www.figma.com/design/he4tiAGOKGPl0Fm56ZpJsy/-Composites--Vapor-Design-System?node-id=2122-28984
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
        <Dialog
            size="${size}"
            title="${header.title}"
            ${header.hasDescription ? figma.code`description="${header.description}"` : ''}
            ${footer.hasFooter ? figma.code`action={${footer.action}}` : ''}
            ${footer.hasFooter && footer.hasAssistive ? figma.code`assistive={${footer.assistive}}` : ''}
        >
            ${body.children}
        </Dialog>
    `,
    imports: ['import { Dialog } from "@vapor-ui/composites"'],
    id: 'dialog',
    metadata: { nestable: true },
};
