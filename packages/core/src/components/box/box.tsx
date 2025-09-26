import { forwardRef } from 'react';

import { useRender } from '@base-ui-components/react/use-render';
import clsx from 'clsx';

import { type Sprinkles, sprinkles } from '~/styles/sprinkles.css';
import type { VComponentProps } from '~/utils/types';

interface BoxProps extends VComponentProps<'div'>, Sprinkles {}

const Box = forwardRef<HTMLDivElement, BoxProps>(
    ({ render, color, className, style, ...props }, ref) => {
        const layout = sprinkles({ color, ...props });

        return useRender({
            ref,
            render: render || <div />,
            props: {
                className: clsx(layout.className, className),
                style: { ...layout.style, ...style },
                ...layout.otherProps,
            },
        });
    },
);
Box.displayName = 'Box';

export { Box };
export type { BoxProps };
