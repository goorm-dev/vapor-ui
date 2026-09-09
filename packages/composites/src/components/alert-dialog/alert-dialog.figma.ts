// url=https://www.figma.com/design/he4tiAGOKGPl0Fm56ZpJsy/-Composites--Vapor-Design-System?node-id=2359-50676&t=TnnpGTYHBh9MjPQH-11
// source=src/components/alert-dialog/alert-dialog.tsx
// component=AlertDialog
import figma from 'figma';

import { getProperties } from '../../utils/figma-utils';

const instance = figma.selectedInstance;

const popup = getProperties(instance, '(Popup)', {
    type: { kind: 'enum', name: 'type', options: { critical: 'critical', confirm: 'confirm' } },
});

const header = getProperties(instance, '(Header)', {
    description: { kind: 'string', name: 'description' },
    title: { kind: 'string', name: 'title' },
});

const body = getProperties(instance, '(Body)', {
    children: { kind: 'slot', name: '(content)' },
});

const footer = getProperties(instance, '(Footer)', {
    cancel: { kind: 'instance', name: 'Cancel' },
    action: { kind: 'instance', name: 'Action' },
});

export default {
    example: figma.code`
        <AlertDialog.Root
            ${popup.type}
            ${header.description}
            ${header.title}
            ${footer.cancel}
            ${footer.action}
        >
            ${body.children}
        </AlertDialog.Root>
    `,
    imports: ['import { AlertDialog } from "@vapor-ui/composites"'],
    id: 'alert-dialog',
    metadata: { nestable: false },
};
