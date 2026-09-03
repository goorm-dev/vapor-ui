// url=https://www.figma.com/design/he4tiAGOKGPl0Fm56ZpJsy/-Composites--Vapor-Design-System?node-id=2337-38499&m=dev
// source=src/components/dialog/dialog.tsx
// component=Dialog
import figma from 'figma';

import { getProperties } from '../../utils/figma-utils';

const instance = figma.selectedInstance;

const popup = getProperties(instance, '(Popup)', {
    size: { kind: 'enum', name: 'size', options: { md: 'md', lg: 'lg', xl: 'xl' } },
});

const header = getProperties(instance, '(Header)', {
    description: { kind: 'string', name: 'description' },
    title: { kind: 'string', name: 'title' },
});

const body = getProperties(instance, '(Body)', {
    children: { kind: 'slot', name: '(content)' },
});

const footer = getProperties(instance, '(Footer)', {
    assistive: { kind: 'instance', name: 'Assistive' },
    action: { kind: 'instance', name: 'Action' },
});

export default {
    example: figma.code`
        <Dialog.Root
            ${popup.size}
            ${header.description}
            ${header.title}
            ${footer.assistive}
            ${footer.action}
        >
            ${body.children}
        </Dialog.Root>
    `,
    imports: ['import { Dialog } from "@vapor-ui/composites"'],
    id: 'dialog',
    metadata: { nestable: false },
};
