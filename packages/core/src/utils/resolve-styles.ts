import type { Sprinkles } from '~/styles/sprinkles.css';
import { sprinkles } from '~/styles/sprinkles.css';

import { createSplitProps } from './create-split-props';
import { mergeProps } from './merge-props';

export const resolveStyles = <T extends object>(props: T) => {
    const [layoutProps, otherProps] = createSplitProps<Sprinkles>()(props, [
        'position',
        'display',

        // Flexbox
        'alignItems',
        'justifyContent',
        'flexDirection',
        'gap',

        // Alignment
        'alignContent',

        // Spacing
        'padding',
        'paddingTop',
        'paddingBottom',
        'paddingLeft',
        'paddingRight',
        'margin',
        'marginTop',
        'marginBottom',
        'marginLeft',
        'marginRight',

        // Dimensions
        'width',
        'height',
        'minWidth',
        'minHeight',
        'maxWidth',
        'maxHeight',

        // Visual
        'border',
        'borderColor',
        'borderRadius',
        'backgroundColor',
        'textColor',
        'opacity',

        // Behavior
        'pointerEvents',
        'overflow',
        'textAlign',

        // Shorthands
        'paddingX',
        'paddingY',
        'marginX',
        'marginY',
    ]);

    const { textColor } = layoutProps;
    const { className, style } = sprinkles({ color: textColor, ...layoutProps });

    return mergeProps({ className, style } as T, otherProps);
};
