// url=https://www.figma.com/design/oxXA7DN1My1R4UFVmrm8Ep/Vapor-Design-System?node-id=44171-7845
// source=src/components/toggle/toggle.tsx
// component=Toggle
import figma from 'figma';

import { bool, example, flags } from '../../utils/figma';

const instance = figma.selectedInstance;

const size = instance.getEnum('size', { sm: 'sm', md: 'md', lg: 'lg', xl: 'xl' });
const variant = instance.getEnum('variant', { default: 'default', accent: 'accent' });
const props = flags({
    defaultPressed: bool(instance, 'pressed'),
    disabled: bool(instance, 'disabled'),
});

const slot = instance.findInstance('🟨Toggle/SlotLayer');
const icon = slot.type === 'INSTANCE' ? example(slot.getInstanceSwap('icon')) : '';

export default {
    example: figma.code`<Toggle size="${size}" variant="${variant}" aria-label="..."${props}>${icon}</Toggle>`,
    imports: ['import { Toggle } from "@vapor-ui/core"'],
    id: 'toggle',
    metadata: { nestable: true },
};
