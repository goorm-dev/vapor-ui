import figma from 'figma';
import type { InstanceHandle } from 'figma';

import { body, bool, connectedChildren, example, flags, pick, toggle } from '../../utils/figma';

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

function isRadioItem(node: InstanceHandle) {
    return node.codeConnectId() === MENU_PART_ID.radioItem;
}

function menuContents(layer: InstanceHandle, indent = '') {
    const runs: InstanceHandle[][] = [];
    for (const node of connectedChildren(layer)) {
        const last = runs[runs.length - 1];
        if (last && isRadioItem(node) && isRadioItem(last[0])) last.push(node);
        else runs.push([node]);
    }

    const snippets = runs.map((run) =>
        isRadioItem(run[0])
            ? figma.code`<Menu.RadioGroup>${body(run.map(example), `${indent}    `)}</Menu.RadioGroup>`
            : example(run[0]),
    );

    return body(snippets, indent);
}

function slotted(layer: InstanceHandle, slot: string) {
    return layer.children
        .filter(
            (node): node is InstanceHandle =>
                node.type === 'INSTANCE' &&
                node.hasCodeConnect() &&
                node.__containingSlotName__ === slot,
        )
        .reduce<unknown>((acc, node) => figma.code`${acc}${example(node)}`, '');
}

function itemContents() {
    const label = instance.findInstance('🟨Menu.ItemLabel/SlotLayer');
    if (label.type !== 'INSTANCE') return '{/* contents */}';

    const leading = toggle(label, 'hasLeadingElement') ? slotted(label, 'leadingElement') : '';
    const trailing = toggle(label, 'hasTrailingElement') ? slotted(label, 'trailingElement') : '';

    return figma.code`${leading}${slotted(label, 'content') || '{/* contents */}'}${trailing}`;
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

        const popup = instance.findConnectedInstance(MENU_PART_ID.popup);
        const items = popup?.type === 'INSTANCE' ? menuContents(popup, '    ') : '{/* contents */}';

        return figma.code`<Menu.Root>
    <Menu.Trigger>{/* trigger */}</Menu.Trigger>
    <Menu.Popup positionerElement={<Menu.PositionerPrimitive side="${side}" align="${align}" />}>${items}</Menu.Popup>
</Menu.Root>`;
    }

    if (part === 'popup' || part === 'submenuPopup' || part === 'group') {
        return figma.code`<${component}>${menuContents(instance)}</${component}>`;
    }

    if (part === 'separator') return figma.code`<Menu.Separator />`;
    if (part === 'groupLabel')
        return figma.code`<Menu.GroupLabel>{/* contents */}</Menu.GroupLabel>`;

    const disabled = flags({ disabled: bool(instance, 'disabled') });

    if (part === 'radioItem') {
        return figma.code`<Menu.RadioItem value="..."${disabled}>${itemContents()}</Menu.RadioItem>`;
    }

    if (part === 'submenuTriggerItem') {
        return figma.code`<Menu.SubmenuRoot>
    <Menu.SubmenuTriggerItem${disabled}>${itemContents()}</Menu.SubmenuTriggerItem>
    <Menu.SubmenuPopup>{/* contents */}</Menu.SubmenuPopup>
</Menu.SubmenuRoot>`;
    }

    return figma.code`<${component}${disabled}>${itemContents()}</${component}>`;
}

export default {
    example: render(),
    imports: ['import { Menu } from "@vapor-ui/core"'],
    id: MENU_PART_ID[part],
    metadata: { nestable: true },
};
