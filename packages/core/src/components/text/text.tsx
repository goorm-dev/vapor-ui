import { forwardRef } from 'react';

import { Primitive } from '@radix-ui/react-primitive';
import clsx from 'clsx';

import type { Foregrounds } from '~/styles/mixins/foreground.css';
import { foregrounds } from '~/styles/mixins/foreground.css';
import { type Typography, typography } from '~/styles/mixins/typography.css';
import type { VComponentProps } from '~/utils/types';

type TextPrimitiveProps = VComponentProps<typeof Primitive.span>;
interface TextProps extends TextPrimitiveProps {
    foreground?: Foregrounds['color'];
    typography?: Typography['style'];
}

const Text = forwardRef<HTMLSpanElement, TextProps>(
    ({ typography: typographyStyle, foreground, className, children, ...props }, ref) => {
        return (
            <Primitive.span
                ref={ref}
                className={clsx(
                    typography({ style: typographyStyle }),
                    foregrounds({ color: foreground }),
                    className,
                )}
                {...props}
            >
                {children}
            </Primitive.span>
        );
    },
);
Text.displayName = 'Text';

export { Text };
export type { TextProps };
