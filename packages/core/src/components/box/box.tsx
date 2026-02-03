import { forwardRef } from 'react';

import { useRender } from '@base-ui/react/use-render';

import { resolveStyles } from '~/utils/resolve-styles';
import type { VComponentProps } from '~/utils/types';

export const Box = forwardRef<HTMLDivElement, Box.Props>((props, ref) => {
    const { render, ...componentProps } = resolveStyles(props);

    return useRender({
        ref,
        render: render || <div />,
        props: componentProps,
    });
});
Box.displayName = 'Box';

export namespace Box {
    export interface Props extends VComponentProps<'div'> {}
}
