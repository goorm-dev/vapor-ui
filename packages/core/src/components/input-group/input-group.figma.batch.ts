import figma from 'figma';

import { example } from '../../utils/figma';

const INPUT_GROUP_PART_ID = {
    root: 'input-group-root',
    counter: 'input-group-counter',
} as const;

type InputGroupPart = keyof typeof INPUT_GROUP_PART_ID;

const instance = figma.selectedInstance;
const part: InputGroupPart = figma.batch.part;

function render() {
    if (part === 'root') {
        const slot = instance.findInstance('🟨InputGroup/SlotLayer');
        // `textinpput` is spelled that way in Figma.
        const fieldId =
            slot.type === 'INSTANCE'
                ? slot.getEnum('type', { textinpput: 'text-input', textarea: 'textarea' })
                : undefined;
        const field =
            slot.type === 'INSTANCE' && fieldId ? example(slot.findConnectedInstance(fieldId)) : '';
        const counter = example(instance.findConnectedInstance(INPUT_GROUP_PART_ID.counter));

        return figma.code`<InputGroup.Root>
    ${field}
    ${counter}
</InputGroup.Root>`;
    }

    // The count text in Figma is a mock; the counter renders `count/maxLength` on its own.
    return figma.code`<InputGroup.Counter />`;
}

export default {
    example: render(),
    imports: ['import { InputGroup } from "@vapor-ui/core"'],
    id: INPUT_GROUP_PART_ID[part],
    metadata: { nestable: true },
};
