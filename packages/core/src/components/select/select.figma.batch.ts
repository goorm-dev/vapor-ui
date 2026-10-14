import figma from 'figma';
import type { InstanceHandle } from 'figma';

import { bool, connectedChildren, example, flags, icon, lines } from '../../utils/figma';

const SELECT_PART_ID = {
    root: 'select-root',
    trigger: 'select-trigger',
    popup: 'select-popup',
    group: 'select-group',
    groupLabel: 'select-group-label',
    item: 'select-item',
    separator: 'select-separator',
} as const;

type SelectPart = keyof typeof SELECT_PART_ID;

const instance = figma.selectedInstance;
const part: SelectPart = figma.batch.part;
const { component } = figma.batch;

function child(name: SelectPart) {
    return example(instance.findConnectedInstance(SELECT_PART_ID[name]));
}

function contents(layer: InstanceHandle, indent = '') {
    const nodes = connectedChildren(layer);
    if (nodes.length === 0) return '{/* contents */}';

    return figma.code`${lines(nodes.map(example), `${indent}    `)}\n${indent}`;
}

// Figma keeps size/invalid/readOnly and the value text on the Trigger; in code they belong to Root.
function rootProps() {
    const trigger = instance.findConnectedInstance(SELECT_PART_ID.trigger);
    if (trigger?.type !== 'INSTANCE') return '';

    const size = trigger.getEnum('size', { sm: 'sm', md: 'md', lg: 'lg', xl: 'xl' });
    const props = flags({
        invalid: bool(trigger, 'invalid'),
        readOnly: bool(trigger, 'readOnly'),
    });

    const slot = trigger.findInstance('🟨Select.Trigger/SlotLayer');
    let text = '';
    if (slot.type === 'INSTANCE') {
        const attr = slot.getEnum('value', { true: 'defaultValue', false: 'placeholder' });
        text = ` ${attr}="${slot.getString('Text')}"`;
    }

    return figma.code` size="${size}"${text}${props}`;
}

function render() {
    if (part === 'root') {
        const side = instance.getEnum('side', {
            bottom: 'bottom',
            top: 'top',
            right: 'right',
            left: 'left',
        });
        const align = instance.getEnum('align', { start: 'start', center: 'center', end: 'end' });

        const popup = instance.findConnectedInstance(SELECT_PART_ID.popup);
        const items = popup?.type === 'INSTANCE' ? contents(popup, '    ') : '{/* contents */}';

        return figma.code`<Select.Root${rootProps()}>
    ${child('trigger')}
    <Select.Popup positionerElement={<Select.PositionerPrimitive side="${side}" align="${align}" />}>${items}</Select.Popup>
</Select.Root>`;
    }

    if (part === 'trigger') {
        return figma.code`<Select.Trigger${flags({ disabled: bool(instance, 'disabled') })} />`;
    }

    if (part === 'popup' || part === 'group') {
        return figma.code`<${component}>${contents(instance)}</${component}>`;
    }

    if (part === 'item') {
        // `item` is lowercase in this layer name in Figma.
        const slot = instance.findInstance('🟨Select.item/SlotLayer');
        const leading = slot.type === 'INSTANCE' ? icon(slot, 'hasLeadingIcon', 'LeadingIcon') : '';

        return figma.code`<Select.Item${flags({ disabled: bool(instance, 'disabled') })}>${leading}{/* contents */}</Select.Item>`;
    }

    if (part === 'separator') {
        return figma.code`<Select.Separator />`;
    }

    return figma.code`<${component}>{/* contents */}</${component}>`;
}

export default {
    example: render(),
    imports: ['import { Select } from "@vapor-ui/core"'],
    id: SELECT_PART_ID[part],
    metadata: { nestable: true },
};
