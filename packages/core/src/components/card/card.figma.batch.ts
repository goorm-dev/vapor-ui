import figma from 'figma';

import { example } from '../../utils/figma';

const CARD_PART_ID = {
    root: 'card-root',
    header: 'card-header',
    body: 'card-body',
    footer: 'card-footer',
} as const;

type CardPart = keyof typeof CARD_PART_ID;

const instance = figma.selectedInstance;
const part: CardPart = figma.batch.part;
const { component } = figma.batch;

function child(name: CardPart) {
    return example(instance.findConnectedInstance(CARD_PART_ID[name]));
}

function render() {
    if (part === 'root') {
        return figma.code`<Card.Root>
    ${child('header')}
    ${child('body')}
    ${child('footer')}
</Card.Root>`;
    }

    return figma.code`<${component}>{/* contents */}</${component}>`;
}

export default {
    example: render(),
    imports: ['import { Card } from "@vapor-ui/core"'],
    id: CARD_PART_ID[part],
    metadata: { nestable: true },
};
