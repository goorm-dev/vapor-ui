// url=https://www.figma.com/design/oxXA7DN1My1R4UFVmrm8Ep/Vapor-Design-System?node-id=44343-7629
// source=src/components/button/button.tsx
// component=Button
import figma from 'figma';

import { bool, flags, icon, pick, text } from '../../utils/figma';

const instance = figma.selectedInstance;

const size = pick(instance, 'size', { sm: 'sm', md: 'md', lg: 'lg', xl: 'xl' });
const colorPalette = pick(instance, 'colorPalette', {
    primary: 'primary',
    secondary: 'secondary',
    success: 'success',
    warning: 'warning',
    danger: 'danger',
    contrast: 'contrast',
});
const variant = pick(instance, 'variant', { fill: 'fill', outline: 'outline', ghost: 'ghost' });

const disabled = bool(instance, 'disabled');

const slot = instance.findInstance('🟨Button/SlotLayer');

// The label property is lowercase `text` in Figma.
const children =
    slot.type === 'INSTANCE'
        ? figma.code`${icon(slot, 'hasLeadingIcon', 'LeadingIcon')}${text(slot, 'text')}${icon(slot, 'hasTrailingIcon', 'TrailingIcon')}`
        : '';

export default {
    example: figma.code`<Button size="${size}" colorPalette="${colorPalette}" variant="${variant}"${flags({ disabled })}>${children}</Button>`,
    imports: ['import { Button } from "@vapor-ui/core"'],
    id: 'button',
    metadata: { nestable: true },
};
