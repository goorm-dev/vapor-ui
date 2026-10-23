// url=https://www.figma.com/design/oxXA7DN1My1R4UFVmrm8Ep/Vapor-Design-System?node-id=34416-17040
// source=src/components/textarea/textarea.tsx
// component=Textarea
import figma from 'figma';

import { bool, flags, pick, placeholder } from '../../utils/figma';

const instance = figma.selectedInstance;

const size = pick(instance, 'size', { sm: 'sm', md: 'md', lg: 'lg', xl: 'xl' });
const props = flags({
    disabled: bool(instance, 'disabled'),
    invalid: bool(instance, 'invalid'),
    readOnly: bool(instance, 'readOnly'),
});
// Parked (Mismatch): Figma `autoResize` shows a manual resize handle, while code `autoResize` grows
// the height and hides the handle, so it's dropped until Figma and code agree.

const slot = instance.findInstance('🟨Textarea/SlotLayer');
const hint = slot.type === 'INSTANCE' ? placeholder(slot) : '';

export default {
    example: figma.code`<Textarea size="${size}"${hint}${props} />`,
    imports: ['import { Textarea } from "@vapor-ui/core"'],
    id: 'textarea',
    metadata: { nestable: true },
};
