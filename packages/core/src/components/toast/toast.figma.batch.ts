import figma from 'figma';
import type { InstanceHandle } from 'figma';

import { bool, example, pick, text, toggle } from '../../utils/figma';

const TOAST_PART_ID = {
    add: 'toast-add',
    close: 'toast-close',
} as const;

type ToastPart = keyof typeof TOAST_PART_ID;

const instance = figma.selectedInstance;
const part: ToastPart = figma.batch.part;

// Strings land inside a JS object, so they are quoted and escaped.
const quote = (value: string) => JSON.stringify(value);

function actionProps() {
    const button = instance.findInstance('💙Button');
    if (button.type !== 'INSTANCE') throw new Error('Figma layer "💙Button" is missing (Drift).');

    const size = pick(button, 'size', { sm: 'sm', md: 'md', lg: 'lg', xl: 'xl' });
    const colorPalette = pick(button, 'colorPalette', {
        primary: 'primary',
        secondary: 'secondary',
        success: 'success',
        warning: 'warning',
        danger: 'danger',
        contrast: 'contrast',
    });
    const variant = pick(button, 'variant', { fill: 'fill', outline: 'outline', ghost: 'ghost' });
    const disabled = bool(button, 'disabled') ? ' disabled: true,' : '';
    const slot = button.findInstance('🟨Button/SlotLayer');
    const label = slot.type === 'INSTANCE' ? quote(text(slot, 'text')) : '"..."';

    return figma.code`
    actionProps: { size: "${size}", colorPalette: "${colorPalette}", variant: "${variant}",${disabled} children: ${label} },`;
}

function render() {
    if (part === 'close') {
        // Toast.ClosePrimitive renders its own icon button inside a toast, and Toast.Provider's list
        // shows it unless the toast is added with `close: false`.
        return figma.code`<Toast.ClosePrimitive />`;
    }

    // Toasts are shown with a call, not JSX: each Figma value becomes an option of `add`.
    const colorPalette = pick(instance, 'colorPalette', {
        info: 'info',
        success: 'success',
        danger: 'danger',
    });
    const description = toggle(instance, 'hasDescription')
        ? figma.code`
    description: ${quote(text(instance, 'Description'))},`
        : '';
    const action = toggle(instance, 'hasButton') ? actionProps() : '';
    // danger and success draw the same icon the code renders by default. Only info swaps one in,
    // read from the layer because `LeadingIcon` is unbound in the other variants.
    const layer = instance.findLayers(
        (node) => node.type === 'INSTANCE' && node.name.startsWith('❤️'),
    )[0] as InstanceHandle | undefined;
    const icon =
        colorPalette === 'info' && layer?.hasCodeConnect()
            ? figma.code`
    icon: ${example(layer)},`
            : '';
    const close = toggle(instance, 'close') ? '' : '\n    close: false,';

    return figma.code`const { add } = Toast.useToastManager();

add({
    title: ${quote(text(instance, 'Title'))},${description}
    colorPalette: "${colorPalette}",${icon}${action}${close}
});`;
}

export default {
    example: render(),
    imports: ['import { Toast } from "@vapor-ui/core"'],
    id: TOAST_PART_ID[part],
    metadata: { nestable: true },
};
