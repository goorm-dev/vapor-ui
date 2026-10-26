// url=https://www.figma.com/design/he4tiAGOKGPl0Fm56ZpJsy/-Composites--Vapor-Design-System?node-id=4754-39350&m=dev
// source=src/components/menu/menu.tsx
// component=Menu.CheckGroup
import figma from 'figma';

import { getProperties, renderInnerInstances } from '../../../utils/figma-utils';

const instance = figma.selectedInstance;

const group = getProperties(instance, null, {
    mode: {
        kind: 'enum',
        name: 'mode',
        options: { single: 'single', multiple: 'multiple' },
    },
    label: { kind: 'string', name: 'label' },
});

const children = renderInnerInstances(instance, new Set(['Check item']));

export default {
    example: figma.code`
        <Menu.CheckGroup ${group.mode} ${group.label}>
            ${children}
        </Menu.CheckGroup>
    `,
    imports: ['import { Menu } from "@vapor-ui/composites"'],
    id: 'menu-check-group',
    metadata: { nestable: true },
};
