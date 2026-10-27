// url=https://www.figma.com/design/oxXA7DN1My1R4UFVmrm8Ep/Vapor-Design-System?node-id=7127-131
// source=src/components/avatar/avatar.tsx
// component=Avatar.Root
import figma from 'figma';

import { pick } from '../../utils/figma';

const instance = figma.selectedInstance;

const size = pick(instance, 'size', { sm: 'sm', md: 'md', lg: 'lg', xl: 'xl' });
const shape = pick(instance, 'shape', { square: 'square', circle: 'circle' });

export default {
    example: figma.code`<Avatar.Root size="${size}" shape="${shape}" alt="..." />`,
    imports: ['import { Avatar } from "@vapor-ui/core"'],
    id: 'avatar',
    metadata: { nestable: true },
};
