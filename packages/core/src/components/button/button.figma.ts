// url=https://www.figma.com/design/oxXA7DN1My1R4UFVmrm8Ep/Vapor-Design-System?node-id=44343-7629
// source=src/components/button/button.tsx
// component=Button
import figma from 'figma';
import type { InstanceHandle } from 'figma';

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

const disabled = instance.getEnum('disabled', { true: true, false: false });

const slot = instance.findInstance('🟨Button/SlotLayer');

function icon(layer: InstanceHandle, visible: string, swap: string) {
    if (!layer.getBoolean(visible)) return '';
    const handle = layer.getInstanceSwap(swap);
    return handle?.type === 'INSTANCE' ? handle.executeTemplate().example : '';
}

const children =
    slot.type === 'INSTANCE'
        ? figma.code`${icon(slot, 'hasLeadingIcon', 'LeadingIcon')}${slot.getString('text')}${icon(slot, 'hasTrailingIcon', 'TrailingIcon')}`
        : '';

export default {
    example: figma.code`<Button size="${size}" colorPalette="${colorPalette}" variant="${variant}"${disabled ? ' disabled' : ''}>${children}</Button>`,
    imports: ['import { Button } from "@vapor-ui/core"'],
    id: 'button',
    metadata: { nestable: true },
};
