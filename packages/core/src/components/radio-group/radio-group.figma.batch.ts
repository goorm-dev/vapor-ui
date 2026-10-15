import figma from 'figma';

import { bool, example, flags } from '../../utils/figma';

const RADIO_GROUP_PART_ID = {
    root: 'radio-group-root',
    label: 'radio-group-label',
    requiredSymbol: 'radio-group-required-symbol',
} as const;

type RadioGroupPart = keyof typeof RADIO_GROUP_PART_ID;

const instance = figma.selectedInstance;
const part: RadioGroupPart = figma.batch.part;
const { component } = figma.batch;

function render() {
    if (part === 'root') {
        const size = instance.getEnum('size', { md: 'md', lg: 'lg' });
        const props = flags({
            disabled: bool(instance, 'disabled'),
            invalid: bool(instance, 'invalid'),
            readOnly: bool(instance, 'readOnly'),
            required: bool(instance, 'required'),
        });
        const label = example(instance.findConnectedInstance(RADIO_GROUP_PART_ID.label));
        // The radios live in the slot layer's `Slot`; its `type` has no code prop.
        const slotLayer = instance.findInstance('🟨RadioGroup/SlotLayer');
        const items = slotLayer.type === 'INSTANCE' ? (slotLayer.getSlot('Slot') ?? '') : '';
        // RadioGroup.Root has no orientation prop yet (column only), so Figma's horizontal maps to a `$css` override.
        const horizontal =
            slotLayer.type === 'INSTANCE' &&
            slotLayer.getEnum('orientation', { horizontal: true, vertical: false });
        const css = horizontal ? ` $css={{ flexDirection: 'row' }}` : '';

        return figma.code`<RadioGroup.Root size="${size}"${props}${css}>
    ${label}
    ${items}
</RadioGroup.Root>`;
    }

    if (part === 'label') {
        const requiredSymbol = example(
            instance.findConnectedInstance(RADIO_GROUP_PART_ID.requiredSymbol),
        );
        return figma.code`<${component}>{/* contents */}${requiredSymbol}</${component}>`;
    }

    return figma.code`<${component} />`;
}

export default {
    example: render(),
    imports: ['import { RadioGroup } from "@vapor-ui/core"'],
    id: RADIO_GROUP_PART_ID[part],
    metadata: { nestable: true },
};
