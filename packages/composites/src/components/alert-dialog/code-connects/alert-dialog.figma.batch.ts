// source=src/components/alert-dialog/alert-dialog.tsx
import figma from 'figma';

import { getProperties } from '../../../utils/figma-utils';

const batch = figma.batch;
const instance = figma.selectedInstance;

function buildButtonSlot() {
    const slotLayer = instance.findInstance('🟨Button/SlotLayer', { traverseInstances: true });

    let leadingIcon;
    let trailingIcon;
    let label;

    if (slotLayer && slotLayer.type === 'INSTANCE') {
        if (slotLayer.getBoolean('hasLeadingIcon')) {
            const icon = slotLayer.getInstanceSwap('LeadingIcon');
            if (icon && icon.type === 'INSTANCE') leadingIcon = icon.executeTemplate().example;
        }
        if (slotLayer.getBoolean('hasTrailingIcon')) {
            const icon = slotLayer.getInstanceSwap('TrailingIcon');
            if (icon && icon.type === 'INSTANCE') trailingIcon = icon.executeTemplate().example;
        }
        label = slotLayer.getString('text');
    }

    return { leadingIcon, trailingIcon, label };
}

function buildRoot() {
    const popup = getProperties(instance, '(Popup)', {
        type: {
            kind: 'enum',
            name: 'type',
            options: { critical: 'critical', confirm: 'confirm' },
        },
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

    return {
        example: figma.code`
        <AlertDialog.Root
            trigger={<Button>...</Button>} // 트리거 요소를 입력하세요.
            ${popup.type}
            ${header.description}
            ${header.title}
            ${footer.cancel}
            ${footer.action}
        >
            ${body.children}
        </AlertDialog.Root>
    `,
        imports: [
            'import { AlertDialog } from "@vapor-ui/composites"',
            'import { Button } from "@vapor-ui/core"',
        ],
    };
}

function buildAction() {
    const { leadingIcon, trailingIcon, label } = buildButtonSlot();
    return {
        example: figma.code`
        <AlertDialog.Action>
            ${leadingIcon}
            ${label}
            ${trailingIcon}
        </AlertDialog.Action>
    `,
        imports: ['import { AlertDialog } from "@vapor-ui/composites"'],
    };
}

function buildCancel() {
    const { leadingIcon, trailingIcon, label } = buildButtonSlot();
    return {
        example: figma.code`
        <AlertDialog.Cancel>
            ${leadingIcon}
            ${label}
            ${trailingIcon}
        </AlertDialog.Cancel>
    `,
        imports: ['import { AlertDialog } from "@vapor-ui/composites"'],
    };
}

/* -----------------------------------------------------------------------------------------------*/

function build() {
    switch (batch.part) {
        case 'alert-dialog-root':
            return buildRoot();
        case 'alert-dialog-action':
            return buildAction();
        case 'alert-dialog-cancel':
            return buildCancel();
    }
}

const result = build();

export default {
    example: result?.example,
    imports: result?.imports,
    id: batch.part,
    metadata: { nestable: true },
};
