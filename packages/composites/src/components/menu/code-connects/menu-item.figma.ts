// url=https://www.figma.com/design/he4tiAGOKGPl0Fm56ZpJsy/-Composites--Vapor-Design-System?node-id=3375-18689&m=dev
// source=src/components/menu/menu.tsx
// component=Menu.Item
import figma from 'figma';

import { getProperties } from '../../../utils/figma-utils';

const instance = figma.selectedInstance;

const item = getProperties(instance, 'Item', {
    isDisabled: {
        kind: 'enum',
        name: 'isDisabled',
        options: { true: true, false: undefined },
    },
    leading: { kind: 'instance-swap', name: 'leading', visibleWhen: '(has leading)' },
    label: { kind: 'string', name: 'label' },
    description: { kind: 'string', name: 'description', visibleWhen: '(has description)' },
    trailing: { kind: 'prop-slot', name: 'trailing', visibleWhen: '(has trailing)' },
    variant: {
        kind: 'enum',
        name: 'variant',
        options: { default: undefined, danger: 'critical' },
    },
});

export default {
    example: figma.code`
        <Menu.Item
            ${item.label} ${item.isDisabled} ${item.leading} ${item.description} ${item.trailing} ${item.variant}
            onClick={() => {}}
        />
    `,
    imports: ['import { Menu } from "@vapor-ui/composites"'],
    id: 'menu-item',
    metadata: { nestable: true },
};
