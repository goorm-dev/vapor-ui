// url=https://www.figma.com/design/oxXA7DN1My1R4UFVmrm8Ep/Vapor-Design-System?node-id=38155-22524
// source=src/components/switch/switch.tsx
// component=Switch.Root
import figma from 'figma';

import { bool, flags, pick } from '../../utils/figma';

const instance = figma.selectedInstance;

const size = pick(instance, 'size', { sm: 'sm', md: 'md', lg: 'lg' });
const props = flags({
    disabled: bool(instance, 'disabled'),
    readOnly: bool(instance, 'readOnly'),
    invalid: bool(instance, 'invalid'),
});

export default {
    example: figma.code`<Switch.Root size="${size}"${props} />`,
    imports: ['import { Switch } from "@vapor-ui/core"'],
    id: 'switch',
    metadata: { nestable: true },
};
