import { forwardRef } from 'react';

import { useRender } from '@base-ui-components/react/use-render';
import clsx from 'clsx';

import type { Foregrounds } from '~/styles/mixins/foreground.css';
import { foregrounds } from '~/styles/mixins/foreground.css';
import { type Typography, typography } from '~/styles/mixins/typography.css';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VComponentProps } from '~/utils/types';

export const Text = forwardRef<HTMLSpanElement, Text.Props>((props, ref) => {
    const {
        render,
        typography: typographyStyle,
        foreground,
        className,
        ...componentProps
    } = resolveStyles(props);

    return useRender({
        ref,
        render: render || <span />,
        props: {
            className: clsx(
                typography({ style: typographyStyle }),
                foregrounds({ color: foreground }),
                className,
            ),
            ...componentProps,
        },
    });
});
Text.displayName = 'Text';

export namespace Text {
    type TextPrimitiveProps = VComponentProps<'span'>;

    export interface Props extends TextPrimitiveProps {
        foreground?: Foregrounds['color'];
        typography?: Typography['style'];
    }
}
