import figma from 'figma';

import { example, pick } from '../../utils/figma';

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
        const field =
            slot.type === 'INSTANCE'
                ? example(
                      slot.findConnectedInstance(
                          pick(slot, 'type', { textinput: 'text-input', textarea: 'textarea' }),
                      ),
                  )
                : '';
        const counter = example(instance.findConnectedInstance(INPUT_GROUP_PART_ID.counter));

        return figma.code`<InputGroup.Root>
    ${field}
    ${counter}
</InputGroup.Root>`;
    }

    return figma.code`<InputGroup.Counter />`;
}

export default {
    example: render(),
    imports: ['import { InputGroup } from "@vapor-ui/core"'],
    id: INPUT_GROUP_PART_ID[part],
    metadata: { nestable: true },
};
