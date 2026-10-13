// url=https://www.figma.com/design/oxXA7DN1My1R4UFVmrm8Ep/Vapor-Design-System?node-id=34413-14570
// source=src/components/text-input/text-input.tsx
// component=TextInput
import figma from 'figma';

const instance = figma.selectedInstance;

const size = instance.getEnum('size', { sm: 'sm', md: 'md', lg: 'lg', xl: 'xl' });
const disabled = instance.getEnum('disabled', { true: true, false: false });
const invalid = instance.getEnum('invalid', { true: true, false: false });
const readOnly = instance.getEnum('readOnly', { true: true, false: false });

const flags = [disabled && ' disabled', invalid && ' invalid', readOnly && ' readOnly']
    .filter(Boolean)
    .join('');

const slot = instance.findInstance('🟨TextInput/SlotLayer');
let text = '';
if (slot.type === 'INSTANCE') {
    const attr = slot.getEnum('value', { true: 'defaultValue', false: 'placeholder' });
    text = ` ${attr}="${slot.getString('Text')}"`;
}

export default {
    example: figma.code`<TextInput size="${size}"${text}${flags} />`,
    imports: ['import { TextInput } from "@vapor-ui/core"'],
    id: 'text-input',
    metadata: { nestable: true },
};
