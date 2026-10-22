// url=https://www.figma.com/design/oxXA7DN1My1R4UFVmrm8Ep/Vapor-Design-System?node-id=32855-4382
// source=src/components/checkbox/checkbox.tsx
// component=Checkbox.Root
import figma from 'figma';

import { bool, flags, pick } from '../../utils/figma';

const instance = figma.selectedInstance;

const size = pick(instance, 'size', { md: 'md', lg: 'lg' });
const props = flags({
    disabled: bool(instance, 'disabled'),
    invalid: bool(instance, 'invalid'),
    readOnly: bool(instance, 'readOnly'),
});

export default {
    example: figma.code`<Checkbox.Root size="${size}"${props} />`,
    imports: ['import { Checkbox } from "@vapor-ui/core"'],
    id: 'checkbox',
    metadata: { nestable: true },
};
