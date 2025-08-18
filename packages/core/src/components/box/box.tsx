import { forwardRef } from 'react';

import { useRender } from '@base-ui-components/react/use-render';
import clsx from 'clsx';

import { type Sprinkles, sprinkles } from '~/styles/sprinkles.css';
import type { VComponentProps } from '~/utils/types';

interface BoxProps extends VComponentProps<'div'>, Sprinkles {}

const Box = forwardRef<HTMLDivElement, BoxProps>(({ render, className, style, ...props }, ref) => {
    const { className: layoutClassName, style: layoutStyle, otherProps } = sprinkles(props);

    return useRender({
        ref,
        render: render || <div />,
        props: {
            className: clsx(layoutClassName, className),
            style: { ...layoutStyle, ...style },
            ...otherProps,
        },
    });
});
Box.displayName = 'Box';

export { Box };
export type { BoxProps };
