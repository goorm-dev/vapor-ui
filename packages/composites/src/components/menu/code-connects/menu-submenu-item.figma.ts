// url=https://www.figma.com/design/he4tiAGOKGPl0Fm56ZpJsy/-Composites--Vapor-Design-System?node-id=3658-11355&m=dev
// source=src/components/menu/menu.tsx
// component=Menu.SubmenuItem
import figma from 'figma';

import { getProperties, renderInnerInstances } from '../../../utils/figma-utils';

const instance = figma.selectedInstance;

const item = getProperties(instance, null, {
    isDisabled: {
        kind: 'enum',
        name: 'isDisabled',
        options: { true: true, false: undefined },
    },
    leading: { kind: 'instance-swap', name: 'leading', visibleWhen: '(has leading)' },
    label: { kind: 'string', name: 'label' },
    description: { kind: 'string', name: 'description', visibleWhen: '(has description)' },
    trailing: { kind: 'prop-slot', name: 'trailing', visibleWhen: '(has trailing)' },
});

// SubmenuItem 안의 (submenu) frame > (add menu element) slot > (Menu element) wrapper 트리에서
// Menu.Root children 으로 쓸 inner 인스턴스를 뽑는다. renderInnerInstances 가 재귀 descend 하면서
// 매칭된 노드에서 멈추므로 wrapper 는 알아서 벗겨진다.
const children = renderInnerInstances(instance, new Set(['Item', 'Item group', 'Check group']));

export default {
    example: figma.code`
        <Menu.Root trigger={<Menu.SubmenuItem ${item.label} ${item.isDisabled} ${item.leading} ${item.description} ${item.trailing} />}>
            ${children}
        </Menu.Root>
    `,
    imports: ['import { Menu } from "@vapor-ui/composites"'],
    id: 'menu-submenu-item',
    metadata: { nestable: true },
};
