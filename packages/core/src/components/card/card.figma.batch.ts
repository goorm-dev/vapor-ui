import figma from 'figma';

import { bool, example } from '../../utils/figma';

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

    // Card.Body has no padding prop yet, so Figma's `hasPadding=false` maps to a `$css` override.
    const noPadding = part === 'body' && !bool(instance, 'hasPadding');
    const css = noPadding ? ` $css={{ padding: '000' }}` : '';

    return figma.code`<${component}${css}>{/* contents */}</${component}>`;
}

export default {
    example: render(),
    imports: ['import { Card } from "@vapor-ui/core"'],
    id: CARD_PART_ID[part],
    metadata: { nestable: true },
};
