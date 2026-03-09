import { forwardRef } from 'react';

import { useRender } from '@base-ui/react/use-render';

import { resolveStyles } from '~/utils/resolve-styles';
import type { VaporUIComponentProps } from '~/utils/types';

export const Box = forwardRef<HTMLDivElement, Box.Props>((props, ref) => {
    const { render, ...componentProps } = resolveStyles(props);

    return useRender({
        ref,
        render,
        defaultTagName: 'div',
        props: componentProps,
    });
});
Box.displayName = 'Box';

export namespace Box {
    export type State = {};
    export type Props = VaporUIComponentProps<'div', State>;
}
