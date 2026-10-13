// url=https://www.figma.com/design/oxXA7DN1My1R4UFVmrm8Ep/Vapor-Design-System?node-id=32283-3971
// source=src/components/icon-button/icon-button.tsx
// component=IconButton
import figma from 'figma';

const instance = figma.selectedInstance;

const size = instance.getEnum('size', { sm: 'sm', md: 'md', lg: 'lg', xl: 'xl' });
const colorPalette = instance.getEnum('colorPalette', {
    primary: 'primary',
    secondary: 'secondary',
    success: 'success',
    warning: 'warning',
    danger: 'danger',
    contrast: 'contrast',
});
const variant = instance.getEnum('variant', { fill: 'fill', outline: 'outline', ghost: 'ghost' });
const shape = instance.getEnum('shape', { square: 'square', circle: 'circle' });
const disabled = instance.getEnum('disabled', { true: true, false: false });

const slot = instance.findInstance('🟨IconButton/SlotLayer');
const iconHandle = slot.type === 'INSTANCE' ? slot.getInstanceSwap('Icon') : undefined;
const icon = iconHandle?.type === 'INSTANCE' ? iconHandle.executeTemplate().example : '';

export default {
    example: figma.code`<IconButton size="${size}" colorPalette="${colorPalette}" variant="${variant}" shape="${shape}" aria-label="..."${disabled ? ' disabled' : ''}>${icon}</IconButton>`,
    imports: ['import { IconButton } from "@vapor-ui/core"'],
    id: 'icon-button',
    metadata: { nestable: true },
};
