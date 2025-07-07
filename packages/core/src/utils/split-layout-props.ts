import type { Sprinkles } from '~/styles/sprinkles.css';

import { createSplitProps } from './create-split-props';

export const splitLayoutProps = <T extends Sprinkles>(props: T) => {
    return createSplitProps<Sprinkles>()(props, [
        'position',
        'display',
        'alignItems',
        'justifyContent',
        'flexDirection',
        'gap',
        'paddingTop',
        'paddingBottom',
        'paddingLeft',
        'paddingRight',
        'marginTop',
        'marginBottom',
        'marginLeft',
        'marginRight',
        'pointerEvents',
        'overflow',
        'opacity',
        'textAlign',
        'padding',
        'paddingX',
        'paddingY',
        'margin',
        'marginX',
        'marginY',
        'border',
        'borderRadius',
        'width',
        'height',
        'minWidth',
        'minHeight',
        'maxWidth',
        'maxHeight',
        'foreground',
        'background',
    ]);
};
