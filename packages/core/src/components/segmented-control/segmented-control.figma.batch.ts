import figma from 'figma';

import { bool, example, flags, icon, lines, pick, swap, text } from '../../utils/figma';

const SEGMENTED_CONTROL_PART_ID = {
    root: 'segmented-control-root',
    item: 'segmented-control-item',
    iconItem: 'segmented-control-icon-item',
} as const;

type SegmentedControlPart = keyof typeof SEGMENTED_CONTROL_PART_ID;

const ITEM_IDS: string[] = [SEGMENTED_CONTROL_PART_ID.item, SEGMENTED_CONTROL_PART_ID.iconItem];

const instance = figma.selectedInstance;
const part: SegmentedControlPart = figma.batch.part;

function render() {
    if (part === 'root') {
        const size = pick(instance, 'size', { sm: 'sm', md: 'md', lg: 'lg' });
        const disabled = bool(instance, 'disabled');
        const items = instance.findConnectedInstances((node) =>
            ITEM_IDS.includes(node.codeConnectId() ?? ''),
        );
        const children = items.length > 0 ? lines(items.map(example)) : '\n    {/* contents */}';

        return figma.code`<SegmentedControl.Root size="${size}"${flags({ disabled })}>${children}
</SegmentedControl.Root>`;
    }

    // Items wrap a Button / IconButton in Figma; only `disabled` and the content carry over.
    if (part === 'item') {
        const button = instance.findInstance('💙Button');
        if (button.type !== 'INSTANCE') return figma.code`<SegmentedControl.Item value="..." />`;

        const slot = button.findInstance('🟨Button/SlotLayer');
        // The label property is lowercase `text` in Figma.
        const children =
            slot.type === 'INSTANCE'
                ? figma.code`${icon(slot, 'hasLeadingIcon', 'LeadingIcon')}${text(slot, 'text')}${icon(slot, 'hasTrailingIcon', 'TrailingIcon')}`
                : '';

        return figma.code`<SegmentedControl.Item value="..."${flags({ disabled: bool(button, 'disabled') })}>${children}</SegmentedControl.Item>`;
    }

    const button = instance.findInstance('💙IconButton');
    if (button.type !== 'INSTANCE')
        return figma.code`<SegmentedControl.IconItem value="..." aria-label="..." />`;

    const slot = button.findInstance('🟨IconButton/SlotLayer');
    const children = slot.type === 'INSTANCE' ? swap(slot, 'Icon') : '';

    return figma.code`<SegmentedControl.IconItem value="..." aria-label="..."${flags({ disabled: bool(button, 'disabled') })}>${children}</SegmentedControl.IconItem>`;
}

export default {
    example: render(),
    imports: ['import { SegmentedControl } from "@vapor-ui/core"'],
    id: SEGMENTED_CONTROL_PART_ID[part],
    metadata: { nestable: true },
};
