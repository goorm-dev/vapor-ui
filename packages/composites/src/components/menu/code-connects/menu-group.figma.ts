// url=https://www.figma.com/design/he4tiAGOKGPl0Fm56ZpJsy/-Composites--Vapor-Design-System?node-id=3213-27184&m=dev
// source=src/components/menu/menu.tsx
// component=Menu.Group
import figma from 'figma';

import { getProperties, renderInnerInstances } from '../../../utils/figma-utils';

const instance = figma.selectedInstance;

const group = getProperties(instance, null, {
    label: { kind: 'string', name: 'label' },
});

const children = renderInnerInstances(instance, new Set(['Item']));

export default {
    example: figma.code`
        <Menu.Group ${group.label}>
            ${children}
        </Menu.Group>
    `,
    imports: ['import { Menu } from "@vapor-ui/composites"'],
    id: 'menu-group',
    metadata: { nestable: true },
};
