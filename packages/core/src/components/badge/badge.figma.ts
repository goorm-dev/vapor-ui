// url=https://www.figma.com/design/oxXA7DN1My1R4UFVmrm8Ep/Vapor-Design-System?node-id=7128-320
// source=src/components/badge/badge.tsx
// component=Badge
import figma from 'figma';

import { icon } from '../../utils/figma';

const instance = figma.selectedInstance;

const colorPalette = instance.getEnum('colorPalette', {
    primary: 'primary',
    success: 'success',
    warning: 'warning',
    danger: 'danger',
    contrast: 'contrast',
    hint: 'hint',
});
const size = instance.getEnum('size', { sm: 'sm', md: 'md', lg: 'lg' });
const shape = instance.getEnum('shape', { pill: 'pill', square: 'square' });

const slot = instance.findInstance('🟨Badge/SlotLayer');

const children =
    slot.type === 'INSTANCE'
        ? figma.code`${icon(slot, 'hasLeadingIcon', 'LeadingIcon')}${slot.getString('Text')}${icon(slot, 'hasTrailingIcon', 'TrailingIcon')}`
        : '';

export default {
    example: figma.code`<Badge colorPalette="${colorPalette}" size="${size}" shape="${shape}">${children}</Badge>`,
    imports: ['import { Badge } from "@vapor-ui/core"'],
    id: 'badge',
    metadata: { nestable: true },
};
