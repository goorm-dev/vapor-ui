// url=https://www.figma.com/design/he4tiAGOKGPl0Fm56ZpJsy/-Composites--Vapor-Design-System?node-id=3375-18738&m=dev
// source=src/components/menu/menu.tsx
// component=Menu.CheckItem
import figma from 'figma';

import { getProperties } from '../../../utils/figma-utils';

const instance = figma.selectedInstance;

const item = getProperties(instance, null, {
    isDisabled: {
        kind: 'enum',
        name: 'isDisabled',
        options: { true: true, false: undefined },
    },
    leading: { kind: 'instance-swap', name: 'leading', visibleWhen: '(has leading)' },
    label: { kind: 'string', name: 'label' },
    description: {
        kind: 'string',
        name: 'description',
        visibleWhen: '(has description)',
    },
    trailing: { kind: 'prop-slot', name: 'trailing', visibleWhen: '(has trailing)' },
});

export default {
    example: figma.code`
        <Menu.CheckItem
            value="" // TODO: 아이템을 특정하는 ID를 추가하세요.
            ${item.label} ${item.isDisabled} ${item.leading} ${item.description} ${item.trailing}
        />
    `,
    imports: ['import { Menu } from "@vapor-ui/composites"'],
    id: 'menu-check-item',
    metadata: { nestable: true },
};
