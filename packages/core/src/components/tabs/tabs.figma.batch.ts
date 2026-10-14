import figma from 'figma';

import { bool, example, flags, icon, lines } from '../../utils/figma';

const TABS_PART_ID = {
    root: 'tabs-root',
    button: 'tabs-button',
} as const;

type TabsPart = keyof typeof TABS_PART_ID;

const instance = figma.selectedInstance;
const part: TabsPart = figma.batch.part;

function render() {
    if (part === 'root') {
        const size = instance.getEnum('size', { sm: 'sm', md: 'md', lg: 'lg', xl: 'xl' });
        const orientation = instance.getEnum('orientation', {
            horizontal: 'horizontal',
            vertical: 'vertical',
        });
        const variant = instance.getEnum('variant', { line: 'line', fill: 'fill' });
        const buttons = instance.findConnectedInstances(
            (node) => node.codeConnectId() === TABS_PART_ID.button,
        );

        // Figma has no List or Panel, so both are emitted as structural placeholders.
        return figma.code`<Tabs.Root size="${size}" orientation="${orientation}" variant="${variant}"${flags({ disabled: bool(instance, 'disabled') })}>
    <Tabs.List>${lines(buttons.map(example), '        ')}
    </Tabs.List>
    <Tabs.Panel value="...">{/* panel */}</Tabs.Panel>
</Tabs.Root>`;
    }

    // The tab label is an unbound text layer in Figma; `selected` lives on Tabs.Root (`defaultValue`).
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
