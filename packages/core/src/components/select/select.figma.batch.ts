import figma from 'figma';
import type { InstanceHandle } from 'figma';

import {
    bool,
    connectedChildren,
    example,
    flags,
    icon,
    lines,
    pick,
    placeholder,
} from '../../utils/figma';

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

function rootProps() {
    const trigger = instance.findConnectedInstance(SELECT_PART_ID.trigger);
    if (trigger?.type !== 'INSTANCE') return '';

    const size = pick(trigger, 'size', { sm: 'sm', md: 'md', lg: 'lg', xl: 'xl' });
    const props = flags({
        invalid: bool(trigger, 'invalid'),
        readOnly: bool(trigger, 'readOnly'),
    });

    const slot = trigger.findInstance('🟨Select.Trigger/SlotLayer');
    const hint = slot.type === 'INSTANCE' ? placeholder(slot) : '';

    return figma.code` size="${size}"${hint}${props}`;
}

function render() {
    if (part === 'root') {
        const side = pick(instance, 'side', {
            bottom: 'bottom',
            top: 'top',
            right: 'right',
            left: 'left',
        });
        const align = pick(instance, 'align', { start: 'start', center: 'center', end: 'end' });

        const popup = instance.findConnectedInstance(SELECT_PART_ID.popup);
        const items = popup?.type === 'INSTANCE' ? contents(popup, '    ') : '{/* contents */}';
        const trigger = child('trigger') || figma.code`<Select.Trigger />`;

        return figma.code`<Select.Root${rootProps()}>
    ${trigger}
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
        const slot = instance.findInstance('🟨Select.Item/SlotLayer');
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
