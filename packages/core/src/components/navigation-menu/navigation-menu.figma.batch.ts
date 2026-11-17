import figma from 'figma';
import type { InstanceHandle } from 'figma';

import { body, bool, example, flags, icon, pick, text, toggle } from '../../utils/figma';

const NAVIGATION_MENU_PART_ID = {
    root: 'navigation-menu-root',
    list: 'navigation-menu-list',
    link: 'navigation-menu-link',
    trigger: 'navigation-menu-trigger',
    content: 'navigation-menu-content',
} as const;

type NavigationMenuPart = keyof typeof NAVIGATION_MENU_PART_ID;

const instance = figma.selectedInstance;
const part: NavigationMenuPart = figma.batch.part;

function connected(layer: InstanceHandle, name: NavigationMenuPart) {
    return example(layer.findConnectedInstance(NAVIGATION_MENU_PART_ID[name]));
}
function item(slot: InstanceHandle) {
    const type = pick(slot, 'type', { Link: 'link', 'Collapsible.Trigger': 'trigger' });
    if (type === 'link') {
        return figma.code`<NavigationMenu.Item>${body([connected(slot, 'link')], '    ')}</NavigationMenu.Item>`;
    }

    const content = toggle(slot, 'hasPanel')
        ? connected(slot, 'content')
        : '<NavigationMenu.Content>{/* panel */}</NavigationMenu.Content>';

    return figma.code`<NavigationMenu.Item>${body([connected(slot, 'trigger'), content], '    ')}</NavigationMenu.Item>`;
}

function render() {
    if (part === 'root') {
        const list = instance.findConnectedInstance(NAVIGATION_MENU_PART_ID.list);
        if (list?.type !== 'INSTANCE')
            return figma.code`<NavigationMenu.Root aria-label="...">{/* contents */}</NavigationMenu.Root>`;

        const size = pick(list, 'size', { sm: 'sm', md: 'md', lg: 'lg', xl: 'xl' });
        const direction = pick(list, 'orientation', {
            horizontal: 'horizontal',
            vertical: 'vertical',
        });

        const trigger = instance.findConnectedInstance(NAVIGATION_MENU_PART_ID.trigger, {
            traverseInstances: true,
        });
        const viewport = trigger?.type === 'INSTANCE' ? '<NavigationMenu.Viewport />' : '';

        return figma.code`<NavigationMenu.Root size="${size}" direction="${direction}" aria-label="...">${body([example(list), viewport].filter(Boolean))}</NavigationMenu.Root>`;
    }

    if (part === 'list') {
        const items = instance.children.filter(
            (node): node is InstanceHandle =>
                node.type === 'INSTANCE' && node.name === '🟨NavigationMenuItem/SlotLayer',
        );

        return figma.code`<NavigationMenu.List>${body(items.map(item))}</NavigationMenu.List>`;
    }

    if (part === 'link') {
        const props = flags({
            current: bool(instance, 'current'),
            disabled: bool(instance, 'disabled'),
        });

        const slot = instance.findInstance('Content');
        const children =
            slot.type === 'INSTANCE'
                ? figma.code`${icon(slot, 'hasLeadingIcon', 'LeadingIcon')}${text(slot, 'Text')}`
                : '{/* contents */}';

        return figma.code`<NavigationMenu.Link href="..."${props}>${children}</NavigationMenu.Link>`;
    }

    if (part === 'trigger') {
        const slot = instance.findInstance('🟨NavigationMenu/SlotLayer');
        const leading = slot.type === 'INSTANCE' ? icon(slot, 'hasLeadingIcon', 'LeadingIcon') : '';

        return figma.code`<NavigationMenu.Trigger${flags({ disabled: bool(instance, 'disabled') })}>${leading}{/* contents */}</NavigationMenu.Trigger>`;
    }

    return figma.code`<NavigationMenu.Content>{/* contents */}</NavigationMenu.Content>`;
}

export default {
    example: render(),
    imports: ['import { NavigationMenu } from "@vapor-ui/core"'],
    id: NAVIGATION_MENU_PART_ID[part],
    metadata: { nestable: true },
};
