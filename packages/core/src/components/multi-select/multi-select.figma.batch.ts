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

const MULTI_SELECT_PART_ID = {
    root: 'multi-select-root',
    trigger: 'multi-select-trigger',
    popup: 'multi-select-popup',
    group: 'multi-select-group',
    groupLabel: 'multi-select-group-label',
    item: 'multi-select-item',
    separator: 'multi-select-separator',
} as const;

type MultiSelectPart = keyof typeof MULTI_SELECT_PART_ID;

const instance = figma.selectedInstance;
const part: MultiSelectPart = figma.batch.part;
const { component } = figma.batch;

function child(name: MultiSelectPart) {
    return example(instance.findConnectedInstance(MULTI_SELECT_PART_ID[name]));
}

function contents(layer: InstanceHandle, indent = '') {
    const nodes = connectedChildren(layer);
    if (nodes.length === 0) return '{/* contents */}';

    return figma.code`${lines(nodes.map(example), `${indent}    `)}\n${indent}`;
}

function rootProps() {
    const trigger = instance.findConnectedInstance(MULTI_SELECT_PART_ID.trigger);
    if (trigger?.type !== 'INSTANCE') return '';

    const size = pick(trigger, 'size', { sm: 'sm', md: 'md', lg: 'lg', xl: 'xl' });
    const props = flags({
        invalid: bool(trigger, 'invalid'),
        readOnly: bool(trigger, 'readOnly'),
    });

    const slot = trigger.findInstance('🟨MultiSelect.Trigger/SlotLayer');
    const hint =
        slot.type === 'INSTANCE' && pick(slot, 'type', { text: true, badge: false })
            ? placeholder(slot)
            : '';

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

        const popup = instance.findConnectedInstance(MULTI_SELECT_PART_ID.popup);
        const items = popup?.type === 'INSTANCE' ? contents(popup, '    ') : '{/* contents */}';
        const trigger = child('trigger') || figma.code`<MultiSelect.Trigger />`;

        return figma.code`<MultiSelect.Root${rootProps()}>
    ${trigger}
    <MultiSelect.Popup positionerElement={<MultiSelect.PositionerPrimitive side="${side}" align="${align}" />}>${items}</MultiSelect.Popup>
</MultiSelect.Root>`;
    }

    if (part === 'trigger') {
        return figma.code`<MultiSelect.Trigger${flags({ disabled: bool(instance, 'disabled') })} />`;
    }

    if (part === 'popup' || part === 'group') {
        return figma.code`<${component}>${contents(instance)}</${component}>`;
    }

    if (part === 'item') {
        // `item` is lowercase in this layer name in Figma.
        const slot = instance.findInstance('🟨MultiSelect.item/SlotLayer');
        const leading = slot.type === 'INSTANCE' ? icon(slot, 'hasLeadingIcon', 'LeadingIcon') : '';

        return figma.code`<MultiSelect.Item${flags({ disabled: bool(instance, 'disabled') })}>${leading}{/* contents */}</MultiSelect.Item>`;
    }

    if (part === 'separator') {
        return figma.code`<MultiSelect.Separator />`;
    }

    return figma.code`<${component}>{/* contents */}</${component}>`;
}

export default {
    example: render(),
    imports: ['import { MultiSelect } from "@vapor-ui/core"'],
    id: MULTI_SELECT_PART_ID[part],
    metadata: { nestable: true },
};
