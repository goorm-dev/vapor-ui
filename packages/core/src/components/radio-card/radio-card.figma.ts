// url=https://www.figma.com/design/oxXA7DN1My1R4UFVmrm8Ep/Vapor-Design-System?node-id=35544-2227
// source=src/components/radio-card/radio-card.tsx
// component=RadioCard
import figma from 'figma';

import { bool, flags } from '../../utils/figma';

const instance = figma.selectedInstance;

// `invaild` is misspelled that way in Figma; it maps to the `invalid` prop.
const props = flags({
    disabled: bool(instance, 'disabled'),
    invalid: bool(instance, 'invaild'),
    readOnly: bool(instance, 'readOnly'),
});

export default {
    example: figma.code`<RadioCard value="..."${props}>{/* contents */}</RadioCard>`,
    imports: ['import { RadioCard } from "@vapor-ui/core"'],
    id: 'radio-card',
    metadata: { nestable: true },
};
