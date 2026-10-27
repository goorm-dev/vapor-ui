// url=https://www.figma.com/design/he4tiAGOKGPl0Fm56ZpJsy/-Composites--Vapor-Design-System?node-id=3199-26103&m=dev
// source=src/components/menu/menu.tsx
// component=Menu.Root
import figma from 'figma';

import { renderInnerInstances } from '../../../utils/figma-utils';

const instance = figma.selectedInstance;

const children = renderInnerInstances(
    instance,
    new Set(['Item', 'Submenu item', 'Item group', 'Check group']),
);

export default {
    example: figma.code`
        <Menu.Root trigger={<Button>Open menu</Button>}>
            ${children}
        </Menu.Root>
    `,
    imports: [
        'import { Menu } from "@vapor-ui/composites"',
        'import { Button } from "@vapor-ui/core"',
    ],
    id: 'menu-root',
    metadata: { nestable: true },
};
