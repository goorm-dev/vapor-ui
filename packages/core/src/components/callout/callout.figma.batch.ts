import figma from 'figma';

import { example, icon, pick } from '../../utils/figma';

const CALLOUT_PART_ID = {
    root: 'callout-root',
    icon: 'callout-icon',
} as const;

type CalloutPart = keyof typeof CALLOUT_PART_ID;

const instance = figma.selectedInstance;
const part: CalloutPart = figma.batch.part;

function render() {
    if (part === 'root') {
        const colorPalette = pick(instance, 'colorPalette', {
            primary: 'primary',
            success: 'success',
            warning: 'warning',
            danger: 'danger',
            contrast: 'contrast',
            hint: 'hint',
        });

        const slot = instance.findInstance('🟨Callout/SlotLayer');
        if (slot.type !== 'INSTANCE') {
            return figma.code`<Callout.Root colorPalette="${colorPalette}">{/* contents */}</Callout.Root>`;
        }

        const text = '{/* contents */}';
        // `LeadingIcon` swaps in a `💙Callout.Icon` instance by default.
        const leadingIcon = icon(slot, 'hasLeadingIcon', 'LeadingIcon');

        if (!leadingIcon) {
            return figma.code`<Callout.Root colorPalette="${colorPalette}">${text}</Callout.Root>`;
        }

        return figma.code`<Callout.Root colorPalette="${colorPalette}">
    ${leadingIcon}
    ${text}
</Callout.Root>`;
    }

    // The icon inside `💙Callout.Icon` is a plain nested instance, not a swap property.
    const [glyph] = instance.findLayers((node) => node.type === 'INSTANCE');
    return figma.code`<Callout.Icon>${example(glyph?.type === 'INSTANCE' ? glyph : null)}</Callout.Icon>`;
}

export default {
    example: render(),
    imports: ['import { Callout } from "@vapor-ui/core"'],
    id: CALLOUT_PART_ID[part],
    metadata: { nestable: true },
};
