import figma from 'figma';
import type { InstanceHandle } from 'figma';

import { bool, connectedChildren, example, flags, icon, lines } from '../../utils/figma';

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

    return figma.code`${lines(nodes.map(renderNode), `${indent}    `)}\n${indent}`;
}

// Figma's MultiSelect.Group nests 💙Select.GroupLabel instead of 💙MultiSelect.GroupLabel.
function renderNode(node: InstanceHandle) {
    if (node.codeConnectId() === 'select-group-label') {
        return figma.code`<MultiSelect.GroupLabel>{/* contents */}</MultiSelect.GroupLabel>`;
    }

    return example(node);
}

// Figma keeps size/invalid/readOnly and the value text on the Trigger; in code they belong to Root.
function rootProps() {
    const trigger = instance.findConnectedInstance(MULTI_SELECT_PART_ID.trigger);
    if (trigger?.type !== 'INSTANCE') return '';

    const size = trigger.getEnum('size', { sm: 'sm', md: 'md', lg: 'lg', xl: 'xl' });
    const props = flags({
        invalid: bool(trigger, 'invalid'),
        readOnly: bool(trigger, 'readOnly'),
    });

    // `type=badge` hides the Text layer and shows Badge instances, which have no value to read.
    const slot = trigger.findInstance('🟨MultiSelect.Trigger/SlotLayer');
    let text = '';
    if (slot.type === 'INSTANCE' && slot.getEnum('type', { text: true, badge: false })) {
        const value = slot.getString('Text');
        text = bool(slot, 'value') ? ` defaultValue={["${value}"]}` : ` placeholder="${value}"`;
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

        const popup = instance.findConnectedInstance(MULTI_SELECT_PART_ID.popup);
        const items = popup?.type === 'INSTANCE' ? contents(popup, '    ') : '{/* contents */}';

        return figma.code`<MultiSelect.Root${rootProps()}>
    ${child('trigger')}
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
        // Figma's MultiSelect.Item reuses Select's slot layer, spelled with a lowercase `item`.
        const slot = instance.findInstance('🟨Select.item/SlotLayer');
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
