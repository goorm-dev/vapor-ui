// url=https://www.figma.com/design/oxXA7DN1My1R4UFVmrm8Ep/Vapor-Design-System?node-id=34416-17040
// source=src/components/textarea/textarea.tsx
// component=Textarea
import figma from 'figma';

import { bool, flags } from '../../utils/figma';

const instance = figma.selectedInstance;

const size = instance.getEnum('size', { sm: 'sm', md: 'md', lg: 'lg', xl: 'xl' });
const props = flags({
    disabled: bool(instance, 'disabled'),
    invalid: bool(instance, 'invalid'),
    readOnly: bool(instance, 'readOnly'),
});
// Figma `resizing` shows a manual resize handle; code `autoResize` grows the height instead, so it's dropped.

const slot = instance.findInstance('🟨Textarea/SlotLayer');
let text = '';
if (slot.type === 'INSTANCE') {
    const attr = slot.getEnum('value', { true: 'defaultValue', false: 'placeholder' });
    text = ` ${attr}="${slot.getString('Text')}"`;
}

export default {
    example: figma.code`<Textarea size="${size}"${text}${props} />`,
    imports: ['import { Textarea } from "@vapor-ui/core"'],
    id: 'textarea',
    metadata: { nestable: true },
};
