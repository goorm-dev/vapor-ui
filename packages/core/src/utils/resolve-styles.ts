import { deprecatedSprinkles, sprinkles } from '~/styles/sprinkles.css';

import { createSplitProps } from './create-split-props';
import { mergeProps } from './merge-props';
import type { DeprecatedSprinkles, Styles } from './types';

export const resolveStyles = <T extends object>(props: T) => {
    const [{ $css }, _otherProps] = createSplitProps<Styles>()(props, ['$css']);

    const [layoutProps, otherProps] = createSplitProps<DeprecatedSprinkles>()(_otherProps, [
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
        'color',
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

    const { className, style } = sprinkles({ ...$css });
    const { className: deprecatedClassName, style: deprecatedStyle } = deprecatedSprinkles({
        ...layoutProps,
        ...$css,
    });

    const mergedProps = mergeProps(
        { className: deprecatedClassName, style: deprecatedStyle },
        { className, style },
    );

    return mergeProps(mergedProps as T, otherProps);
};
