// url=https://www.figma.com/design/oxXA7DN1My1R4UFVmrm8Ep/Vapor-Design-System?node-id=32855-4382
// source=src/components/checkbox/checkbox.tsx
// component=Checkbox.Root
import figma from 'figma';

import { bool, flags } from '../../utils/figma';

const instance = figma.selectedInstance;

const size = instance.getEnum('size', { md: 'md', lg: 'lg' });
// `readOnly` also has a `Default` option in Figma; anything but `true` reads as false.
const props = flags({
    defaultChecked: bool(instance, 'checked'),
    disabled: bool(instance, 'disabled'),
    indeterminate: bool(instance, 'indeterminate'),
    invalid: bool(instance, 'invalid'),
    readOnly: bool(instance, 'readOnly'),
});

export default {
    example: figma.code`<Checkbox.Root size="${size}"${props} />`,
    imports: ['import { Checkbox } from "@vapor-ui/core"'],
    id: 'checkbox',
    metadata: { nestable: true },
};
