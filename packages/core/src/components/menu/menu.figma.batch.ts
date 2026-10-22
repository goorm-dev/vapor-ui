import figma from 'figma';
import type { InstanceHandle } from 'figma';

import { bool, connectedChildren, example, flags, icon, lines } from '../../utils/figma';

const MENU_PART_ID = {
    root: 'menu-root',
    popup: 'menu-popup',
    submenuPopup: 'menu-submenu-popup',
    group: 'menu-group',
    groupLabel: 'menu-group-label',
    separator: 'menu-separator',
    item: 'menu-item',
    submenuTriggerItem: 'menu-submenu-trigger-item',
    checkboxItem: 'menu-checkbox-item',
    radioItem: 'menu-radio-item',
} as const;

type MenuPart = keyof typeof MENU_PART_ID;

const instance = figma.selectedInstance;
const part: MenuPart = figma.batch.part;
const { component } = figma.batch;

function contents(layer: InstanceHandle, indent = '') {
    const nodes = connectedChildren(layer);
    if (nodes.length === 0) return '{/* contents */}';

    return figma.code`${lines(nodes.map(example), `${indent}    `)}\n${indent}`;
}

function itemContents() {
    const slot = instance.findInstance('🟨Menu/SlotLayer');
    if (slot.type !== 'INSTANCE') return '{/* contents */}';

    return figma.code`${icon(slot, 'hasLeadingIcon', 'LeadingIcon')}{/* contents */}${icon(slot, 'hasTrailingIcon', 'TrailingIcon')}`;
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

        const popup = instance.findConnectedInstance(MENU_PART_ID.popup);
        const items = popup?.type === 'INSTANCE' ? contents(popup, '    ') : '{/* contents */}';

        return figma.code`<Menu.Root>
    <Menu.Trigger>{/* trigger */}</Menu.Trigger>
    <Menu.Popup positionerElement={<Menu.PositionerPrimitive side="${side}" align="${align}" />}>${items}</Menu.Popup>
</Menu.Root>`;
    }

    if (part === 'popup' || part === 'submenuPopup' || part === 'group') {
        return figma.code`<${component}>${contents(instance)}</${component}>`;
    }

    const disabled = flags({ disabled: bool(instance, 'disabled') });

    if (part === 'item' || part === 'checkboxItem') {
        return figma.code`<${component}${disabled}>${itemContents()}</${component}>`;
    }

    if (part === 'radioItem') {
        return figma.code`<Menu.RadioItem value="..."${disabled}>${itemContents()}</Menu.RadioItem>`;
    }

    if (part === 'submenuTriggerItem') {
        // `hasPopup` toggles the nested SubmenuPopup; code needs one either way.
        const slot = instance.findInstance('🟨Menu.SubTriggerItem/SlotLayer');
        const popup =
            slot.type === 'INSTANCE' && slot.getBoolean('hasPopup')
                ? example(slot.findConnectedInstance(MENU_PART_ID.submenuPopup))
                : '';

        return figma.code`<Menu.SubmenuRoot>
    <Menu.SubmenuTriggerItem${disabled}>${itemContents()}</Menu.SubmenuTriggerItem>
    ${popup || '<Menu.SubmenuPopup>{/* contents */}</Menu.SubmenuPopup>'}
</Menu.SubmenuRoot>`;
    }

    if (part === 'separator') {
        return figma.code`<Menu.Separator />`;
    }

    return figma.code`<${component}>{/* contents */}</${component}>`;
}

export default {
    example: render(),
    imports: ['import { Menu } from "@vapor-ui/core"'],
    id: MENU_PART_ID[part],
    metadata: { nestable: true },
};
