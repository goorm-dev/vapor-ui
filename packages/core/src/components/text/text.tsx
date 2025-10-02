import { forwardRef } from 'react';

import { useRender } from '@base-ui-components/react/use-render';
import clsx from 'clsx';

import type { Foregrounds } from '~/styles/mixins/foreground.css';
import { foregrounds } from '~/styles/mixins/foreground.css';
import { type Typography, typography } from '~/styles/mixins/typography.css';
import type { VComponentProps } from '~/utils/types';

type TextPrimitiveProps = VComponentProps<'span'>;
interface TextProps extends TextPrimitiveProps {
    foreground?: Foregrounds['color'];
    typography?: Typography['style'];
}

/**
 * Renders text with customizable typography and color styles. Renders a <span> element by default.
 */
const Text = forwardRef<HTMLSpanElement, TextProps>(
    ({ render, typography: typographyStyle, foreground, className, ...props }, ref) => {
        return useRender({
            ref,
            render: render || <span />,
            props: {
                className: clsx(
                    typography({ style: typographyStyle }),
                    foregrounds({ color: foreground }),
                    className,
                ),
                ...props,
            },
        });
    },
);
Text.displayName = 'Text';

export { Text };
export type { TextProps };
