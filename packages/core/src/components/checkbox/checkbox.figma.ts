// url=https://www.figma.com/design/oxXA7DN1My1R4UFVmrm8Ep/Vapor-Design-System?node-id=32855-4382
// source=src/components/checkbox/checkbox.tsx
// component=Checkbox.Root
import figma from 'figma';

const instance = figma.selectedInstance;

const size = instance.getEnum('size', { md: 'md', lg: 'lg' });
const disabled = instance.getEnum('disabled', { true: true, false: false });
const indeterminate = instance.getEnum('indeterminate', { true: true, false: false });
const invalid = instance.getEnum('invalid', { true: true, false: false });
const readOnly = instance.getEnum('readOnly', { true: true, false: false, Default: false });

const flags = [
    disabled && ' disabled',
    indeterminate && ' indeterminate',
    invalid && ' invalid',
    readOnly && ' readOnly',
]
    .filter(Boolean)
    .join('');

export default {
    example: figma.code`<Checkbox.Root size="${size}"${flags} />`,
    imports: ['import { Checkbox } from "@vapor-ui/core"'],
    id: 'checkbox',
    metadata: { nestable: true },
};
