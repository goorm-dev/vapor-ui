import { forwardRef } from 'react';

import { useRenderElement } from '~/hooks/use-render-element';
import type { Foregrounds } from '~/styles/mixins/foreground.css';
import { foregrounds } from '~/styles/mixins/foreground.css';
import type { Typography } from '~/styles/mixins/typography.css';
import { typography } from '~/styles/mixins/typography.css';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VaporUIComponentProps } from '~/utils/types';

export const Text = forwardRef<HTMLSpanElement, Text.Props>((props, ref) => {
    const {
        render,
        typography: typographyStyle,
        foreground,
        className,
        ...componentProps
    } = resolveStyles(props);

    return useRenderElement({
        ref,
        render,
        defaultTagName: 'span',
        props: {
            className: [
                typography({ style: typographyStyle }),
                foregrounds({ color: foreground }),
                className,
            ],
            ...componentProps,
        },
    });
});
Text.displayName = 'Text';

export namespace Text {
    type TextVariants = {
        foreground?: Foregrounds['color'];
        typography?: Typography['style'];
    };

    export type State = {};
    export type Props = VaporUIComponentProps<'span', State> & TextVariants;
}
