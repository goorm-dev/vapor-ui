import figma from 'figma';

import { example } from '../../utils/figma';

const ALERT_DIALOG_PART_ID = {
    root: 'alert-dialog-root',
    popup: 'alert-dialog-popup',
    header: 'alert-dialog-header',
    body: 'alert-dialog-body',
    footer: 'alert-dialog-footer',
} as const;

type AlertDialogPart = keyof typeof ALERT_DIALOG_PART_ID;

const instance = figma.selectedInstance;
const part: AlertDialogPart = figma.batch.part;
const { component } = figma.batch;

function child(name: AlertDialogPart) {
    return example(instance.findConnectedInstance(ALERT_DIALOG_PART_ID[name]));
}

function render() {
    if (part === 'root') {
        return figma.code`<AlertDialog.Root>
    ${child('popup')}
</AlertDialog.Root>`;
    }

    if (part === 'popup') {
        return figma.code`<AlertDialog.Popup>
    ${child('header')}
    ${child('body')}
    ${child('footer')}
</AlertDialog.Popup>`;
    }

    return figma.code`<${component}>{/* contents */}</${component}>`;
}

export default {
    example: render(),
    imports: ['import { AlertDialog } from "@vapor-ui/core"'],
    id: ALERT_DIALOG_PART_ID[part],
    metadata: { nestable: true },
};
