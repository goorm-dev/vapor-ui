import { forwardRef } from 'react';

import { useRender } from '@base-ui-components/react/use-render';

import { resolveStyles } from '~/utils/resolve-styles';
import type { VComponentProps } from '~/utils/types';

interface BoxProps extends VComponentProps<'div'> {}

const Box = forwardRef<HTMLDivElement, BoxProps>((props, ref) => {
    const { render, ...componentProps } = resolveStyles(props);

    return useRender({
        ref,
        render: render || <div />,
        props: componentProps,
    });
});
Box.displayName = 'Box';

export { Box };
export type { BoxProps };
