// url=https://www.figma.com/design/oxXA7DN1My1R4UFVmrm8Ep/Vapor-Design-System?node-id=32283-3971
// source=src/components/icon-button/icon-button.tsx
// component=IconButton
import figma from 'figma';

import { bool, flags, pick, swap } from '../../utils/figma';

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
const shape = pick(instance, 'shape', { square: 'square', circle: 'circle' });
const disabled = bool(instance, 'disabled');

const slot = instance.findInstance('🟨IconButton/SlotLayer');
const icon = slot.type === 'INSTANCE' ? swap(slot, 'Icon') : '';

export default {
    example: figma.code`<IconButton size="${size}" colorPalette="${colorPalette}" variant="${variant}" shape="${shape}" aria-label="..."${flags({ disabled })}>${icon}</IconButton>`,
    imports: ['import { IconButton } from "@vapor-ui/core"'],
    id: 'icon-button',
    metadata: { nestable: true },
};
