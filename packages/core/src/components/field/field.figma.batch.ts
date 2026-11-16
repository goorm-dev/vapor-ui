import figma from 'figma';
import type { InstanceHandle } from 'figma';

import { body, connectedChildren, example, toggle } from '../../utils/figma';

const FIELD_PART_ID = {
    root: 'field-root',
    description: 'field-description',
    error: 'field-error',
    success: 'field-success',
} as const;

type FieldPart = keyof typeof FIELD_PART_ID;

const instance = figma.selectedInstance;
const part: FieldPart = figma.batch.part;
const { component } = figma.batch;

function child(name: FieldPart) {
    return example(instance.findConnectedInstance(FIELD_PART_ID[name]));
}

// 💙Field.Label has no batch entry: its main component was deleted from the file, so it
// can't be connected. Root renders it from the layer instead.
function label() {
    const layer = instance.findInstance('💙Field.Label', { traverseInstances: true });
    if (layer.type !== 'INSTANCE') return '';

    const slot = layer.findInstance('🟨Field.Label/SlotLayer');
    const required =
        slot.type === 'INSTANCE' && toggle(slot, 'required') ? '<Field.RequiredSymbol />' : '';

    return figma.code`<Field.Label>{/* contents */}${required}</Field.Label>`;
}

// The control sits in 🟨Field/SlotLayer; its `type=default` option holds a plain "Slot" text.
function control() {
    const slot = instance.findInstance('🟨Field/SlotLayer', { traverseInstances: true });
    const controls = slot.type === 'INSTANCE' ? connectedChildren(slot).map(example) : [];

    return controls.length > 0 ? controls : ['{/* contents */}'];
}

function render() {
    if (part === 'root') {
        // 🟨Field.Label/SlotLayer `side` is dropped: Field.Label has no side prop.
        const parts = [
            label(),
            ...control(),
            child('description'),
            child('success'),
            child('error'),
        ].filter(Boolean);

        return figma.code`<Field.Root>${body(parts)}</Field.Root>`;
    }

    const slot = instance.findInstance(`🟨${component}/SlotLayer`);
    const leading =
        slot.type === 'INSTANCE' && toggle(slot, 'hasLeadingIcon')
            ? example(
                  slot.children.find((node): node is InstanceHandle => node.type === 'INSTANCE'),
              )
            : '';

    return figma.code`<${component}>${leading}{/* contents */}</${component}>`;
}

export default {
    example: render(),
    imports: ['import { Field } from "@vapor-ui/core"'],
    id: FIELD_PART_ID[part],
    metadata: { nestable: true },
};
