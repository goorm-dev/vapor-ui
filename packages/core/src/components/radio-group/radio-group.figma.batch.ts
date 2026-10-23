import figma from 'figma';
import type { InstanceHandle } from 'figma';

import { bool, example, flags, lines, pick } from '../../utils/figma';

const RADIO_GROUP_PART_ID = {
    root: 'radio-group-root',
    label: 'radio-group-label',
    requiredSymbol: 'radio-group-required-symbol',
} as const;

type RadioGroupPart = keyof typeof RADIO_GROUP_PART_ID;

const instance = figma.selectedInstance;
const part: RadioGroupPart = figma.batch.part;
const { component } = figma.batch;

const EMPTY = '\n    {/* contents */}';

// The radios sit in the slot layer's `Slot`, each inside an unconnected 💙Field.label wrapper.
function radios(slotLayer: InstanceHandle) {
    // `type` is spelled `radio` and `RadioCard` in Figma.
    const id = pick(slotLayer, 'type', { radio: 'radio', RadioCard: 'radio-card' });
    const handles = slotLayer.findConnectedInstances((node) => node.codeConnectId() === id, {
        traverseInstances: true,
    });

    return handles.length > 0 ? lines(handles.map(example)) : EMPTY;
}

function render() {
    if (part === 'root') {
        const size = pick(instance, 'size', { md: 'md', lg: 'lg' });
        const props = flags({
            disabled: bool(instance, 'disabled'),
            invalid: bool(instance, 'invalid'),
            readOnly: bool(instance, 'readOnly'),
            required: bool(instance, 'required'),
        });
        const label = example(instance.findConnectedInstance(RADIO_GROUP_PART_ID.label));

        // `orientation` is dropped: Root is a column that also holds the Label, so a `$css`
        // override can't lay out only the radios horizontally.
        const slotLayer = instance.findInstance('🟨RadioGroup/SlotLayer');
        const items = slotLayer.type === 'INSTANCE' ? radios(slotLayer) : EMPTY;

        return figma.code`<RadioGroup.Root size="${size}"${props}>
    ${label}${items}
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
