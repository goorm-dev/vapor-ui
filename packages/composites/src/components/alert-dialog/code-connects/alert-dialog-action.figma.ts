// url=https://www.figma.com/design/he4tiAGOKGPl0Fm56ZpJsy/-Composites--Vapor-Design-System?node-id=4589-26511&m=dev
// source=src/components/alert-dialog/alert-dialog.tsx
// component=AlertDialog.Action
import figma from 'figma';

const instance = figma.selectedInstance;
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

export default {
    example: figma.code`
        <AlertDialog.Action>
            ${leadingIcon}
            ${label}
            ${trailingIcon}
        </AlertDialog.Action>
    `,
    imports: ['import { AlertDialog } from "@vapor-ui/composites"'],
    id: 'alert-dialog-action',
    metadata: { nestable: true },
};
