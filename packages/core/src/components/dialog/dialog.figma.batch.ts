import figma from 'figma';

import { example } from '../../utils/figma';

const DIALOG_PART_ID = {
    root: 'dialog-root',
    popup: 'dialog-popup',
    header: 'dialog-header',
    body: 'dialog-body',
    footer: 'dialog-footer',
} as const;

type DialogPart = keyof typeof DIALOG_PART_ID;

const instance = figma.selectedInstance;
const part: DialogPart = figma.batch.part;
const { component } = figma.batch;

function child(name: DialogPart) {
    return example(instance.findConnectedInstance(DIALOG_PART_ID[name]));
}

function render() {
    if (part === 'root') {
        const size = instance.getEnum('size', { md: 'md', lg: 'lg', xl: 'xl' });
        return figma.code`<Dialog.Root size="${size}">
    ${child('popup')}
</Dialog.Root>`;
    }

    if (part === 'popup') {
        return figma.code`<Dialog.Popup>
    ${child('header')}
    ${child('body')}
    ${child('footer')}
</Dialog.Popup>`;
    }

    return figma.code`<${component}>{/* contents */}</${component}>`;
}

export default {
    example: render(),
    imports: ['import { Dialog } from "@vapor-ui/core"'],
    id: DIALOG_PART_ID[part],
    metadata: { nestable: true },
};
