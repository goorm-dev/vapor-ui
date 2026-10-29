// source=src/components/dialog/dialog.tsx
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

    return {
        example: figma.code`
        <Dialog.Root
            ariaLabels={} // TODO: 닫기 버튼의 aria-label을 지정하세요.
            trigger={<Button>...</Button>} // TODO: 트리거 요소를 입력하세요.
            ${popup.size}
            ${header.title}
            ${header.description}
            ${footer.assistive}
            ${footer.action}
        >
            ${body.children}
        </Dialog.Root>
    `,
        imports: [
            'import { Dialog } from "@vapor-ui/composites"',
            'import { Button } from "@vapor-ui/core"',
        ],
    };
}

function buildAction() {
    const { leadingIcon, trailingIcon, label } = buildButtonSlot();
    return {
        example: figma.code`
        <Dialog.Action>
            ${leadingIcon}
            ${label}
            ${trailingIcon}
        </Dialog.Action>
    `,
        imports: ['import { Dialog } from "@vapor-ui/composites"'],
    };
}

function buildAssistive() {
    const { leadingIcon, trailingIcon, label } = buildButtonSlot();
    return {
        example: figma.code`
        <Dialog.Assistive>
            ${leadingIcon}
            ${label}
            ${trailingIcon}
        </Dialog.Assistive>
    `,
        imports: ['import { Dialog } from "@vapor-ui/composites"'],
    };
}

/* -----------------------------------------------------------------------------------------------*/

function build() {
    switch (batch.part) {
        case 'dialog-root':
            return buildRoot();
        case 'dialog-action':
            return buildAction();
        case 'dialog-assistive':
            return buildAssistive();
    }
}

const result = build();

export default {
    example: result?.example,
    imports: result?.imports,
    id: batch.part,
    metadata: { nestable: true },
};
