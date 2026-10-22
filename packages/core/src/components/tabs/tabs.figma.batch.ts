import figma from 'figma';

import { bool, example, flags, icon, lines, pick } from '../../utils/figma';

const TABS_PART_ID = {
    root: 'tabs-root',
    button: 'tabs-button',
} as const;

type TabsPart = keyof typeof TABS_PART_ID;

const instance = figma.selectedInstance;
const part: TabsPart = figma.batch.part;

function render() {
    if (part === 'root') {
        const size = pick(instance, 'size', { sm: 'sm', md: 'md', lg: 'lg', xl: 'xl' });
        const orientation = pick(instance, 'orientation', {
            horizontal: 'horizontal',
            vertical: 'vertical',
        });
        const variant = pick(instance, 'variant', { line: 'line', fill: 'fill' });
        const buttons = instance.findConnectedInstances(
            (node) => node.codeConnectId() === TABS_PART_ID.button,
        );

        return figma.code`<Tabs.Root size="${size}" orientation="${orientation}" variant="${variant}"${flags({ disabled: bool(instance, 'disabled') })}>
    <Tabs.List>${lines(buttons.map(example), '        ')}
    </Tabs.List>
    <Tabs.Panel value="...">{/* panel */}</Tabs.Panel>
</Tabs.Root>`;
    }

    const slot = instance.findInstance('🟨Tabs.Button/SlotLayer');
    const children =
        slot.type === 'INSTANCE'
            ? figma.code`${icon(slot, 'hasLeadingIcon', 'LeadingIcon')}{/* contents */}${icon(slot, 'hasTrailingIcon', 'TrailingIcon')}`
            : '{/* contents */}';

    return figma.code`<Tabs.Button value="..."${flags({ disabled: bool(instance, 'disabled') })}>${children}</Tabs.Button>`;
}

export default {
    example: render(),
    imports: ['import { Tabs } from "@vapor-ui/core"'],
    id: TABS_PART_ID[part],
    metadata: { nestable: true },
};
