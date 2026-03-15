import { forwardRef } from 'react';

import { useRenderElement } from '~/hooks/use-render-element';
import { cn } from '~/utils/cn';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VaporUIComponentProps } from '~/utils/types';

import * as styles from './text.css';
import type { TextVariants } from './text.css';

export const Text = forwardRef<HTMLSpanElement, Text.Props>((props, ref) => {
    const { render, typography, foreground, className, ...componentProps } = resolveStyles(props);

    return useRenderElement({
        ref,
        render,
        defaultTagName: 'span',
        props: {
            className: cn(
                styles.root({ typography, foreground }),
                className,
                // typography({ style: typographyStyle }),
                // foregrounds({ color: foreground }),
            ),
            ...componentProps,
        },
    });
});
Text.displayName = 'Text';

export namespace Text {
    // type TextVariants = {
    //     foreground?: Foregrounds['color'];
    //     typography?: Typography['style'];
    // };

    export type State = {};
    export type Props = VaporUIComponentProps<'span', State> & TextVariants;
}
