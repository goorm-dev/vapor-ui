import figma from 'figma';
import type { SlotResult } from 'figma';

import { bool, example, flags, icon, lines } from '../../utils/figma';

const SEGMENTED_CONTROL_PART_ID = {
    root: 'segmented-control-root',
    item: 'segmented-control-item',
    iconItem: 'segmented-control-icon-item',
} as const;

type SegmentedControlPart = keyof typeof SEGMENTED_CONTROL_PART_ID;

// One SLOT per segment, left to right. Figma names the first one without a number.
const SLOTS = [
    'Slotlayer',
    'Slotlayer2',
    'Slotlayer3',
    'Slotlayer4',
    'Slotlayer5',
    'Slotlayer6',
    'Slotlayer7',
];

const instance = figma.selectedInstance;
const part: SegmentedControlPart = figma.batch.part;

// Skip slots known to be empty, then fold the rest into one tagged template, one per line.
function filled(slots: (SlotResult | undefined)[]) {
    return slots.filter(
        (slot): slot is SlotResult => !!slot && slot.connectedInstances?.length !== 0,
    );
}

function render() {
    if (part === 'root') {
        const size = instance.getEnum('size', { sm: 'sm', md: 'md', lg: 'lg' });
        const disabled = bool(instance, 'disabled');
        const items = lines(filled(SLOTS.map((name) => instance.getSlot(name))));

        return figma.code`<SegmentedControl.Root size="${size}"${flags({ disabled })}>${items}
</SegmentedControl.Root>`;
    }

    // Items wrap a Button / IconButton in Figma; only `disabled` and the content carry over.
    if (part === 'item') {
        const button = instance.findInstance('💙Button');
        if (button.type !== 'INSTANCE') return figma.code`<SegmentedControl.Item value="..." />`;

        const slot = button.findInstance('🟨Button/SlotLayer');
        const children =
            slot.type === 'INSTANCE'
                ? figma.code`${icon(slot, 'hasLeadingIcon', 'LeadingIcon')}${slot.getString('text')}${icon(slot, 'hasTrailingIcon', 'TrailingIcon')}`
                : '';

        return figma.code`<SegmentedControl.Item value="..."${flags({ disabled: bool(button, 'disabled') })}>${children}</SegmentedControl.Item>`;
    }

    const button = instance.findInstance('💙IconButton');
    if (button.type !== 'INSTANCE')
        return figma.code`<SegmentedControl.IconItem value="..." aria-label="..." />`;

    const slot = button.findInstance('🟨IconButton/SlotLayer');
    const children = slot.type === 'INSTANCE' ? example(slot.getInstanceSwap('Icon')) : '';

    return figma.code`<SegmentedControl.IconItem value="..." aria-label="..."${flags({ disabled: bool(button, 'disabled') })}>${children}</SegmentedControl.IconItem>`;
}

export default {
    example: render(),
    imports: ['import { SegmentedControl } from "@vapor-ui/core"'],
    id: SEGMENTED_CONTROL_PART_ID[part],
    metadata: { nestable: true },
};
