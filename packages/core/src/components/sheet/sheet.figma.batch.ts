import figma from 'figma';

import { bool, example, flags, pick, toggle } from '../../utils/figma';

const SHEET_PART_ID = {
    root: 'sheet-root',
    popup: 'sheet-popup',
    resizeHandle: 'sheet-resize-handle',
    header: 'sheet-header',
    body: 'sheet-body',
    footer: 'sheet-footer',
} as const;

type SheetPart = keyof typeof SHEET_PART_ID;

const instance = figma.selectedInstance;
const part: SheetPart = figma.batch.part;
const { component } = figma.batch;

function child(name: SheetPart) {
    return example(instance.findConnectedInstance(SHEET_PART_ID[name]));
}

function render() {
    // The root's `side` only mirrors the nested Popup's `side`, which the popup template emits.
    if (part === 'root') {
        return figma.code`<Sheet.Root>
    ${child('popup')}
</Sheet.Root>`;
    }

    if (part === 'popup') {
        const side = pick(instance, 'side', {
            left: 'left',
            right: 'right',
            top: 'top',
            bottom: 'bottom',
        });
        const handle = toggle(instance, 'showHandle')
            ? figma.code`
    ${child('resizeHandle')}`
            : '';

        return figma.code`<Sheet.Popup positionerElement={<Sheet.PositionerPrimitive side="${side}" />}>${handle}
    ${child('header')}
    ${child('body')}
    ${child('footer')}
</Sheet.Popup>`;
    }

    if (part === 'resizeHandle') {
        return figma.code`<Sheet.ResizeHandle${flags({ disabled: bool(instance, 'disabled') })} />`;
    }

    return figma.code`<${component}>{/* contents */}</${component}>`;
}

export default {
    example: render(),
    imports: ['import { Sheet } from "@vapor-ui/core"'],
    id: SHEET_PART_ID[part],
    metadata: { nestable: true },
};
