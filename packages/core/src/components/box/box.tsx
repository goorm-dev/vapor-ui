import { forwardRef } from 'react';

import { useRender } from '@base-ui-components/react/use-render';
import clsx from 'clsx';

import { type Sprinkles, sprinkles } from '~/styles/sprinkles.css';
import type { VComponentProps } from '~/utils/types';

export const Box = forwardRef<HTMLDivElement, Box.Props>(
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

export namespace Box {
    export interface Props extends VComponentProps<'div'>, Sprinkles {}
}
