// url=https://www.figma.com/design/oxXA7DN1My1R4UFVmrm8Ep/Vapor-Design-System?node-id=45635-12436
// source=src/components/toggle-group/toggle-group.tsx
// component=ToggleGroup
import figma from 'figma';

import { bool, example, flags, lines, pick } from '../../utils/figma';

const instance = figma.selectedInstance;

const size = pick(instance, 'size', { sm: 'sm', md: 'md', lg: 'lg', xl: 'xl' });
const disabled = bool(instance, 'disabled');

const toggles = lines(
    instance.findConnectedInstances((node) => node.codeConnectId() === 'toggle').map(example),
);

export default {
    example: figma.code`<ToggleGroup size="${size}"${flags({ disabled })}>${toggles}
</ToggleGroup>`,
    imports: ['import { ToggleGroup } from "@vapor-ui/core"'],
    id: 'toggle-group',
    metadata: { nestable: true },
};
