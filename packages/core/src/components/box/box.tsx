import { forwardRef } from 'react';

import { useRenderElement } from '~/hooks/use-render-element';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VaporUIComponentProps } from '~/utils/types';

export const Box = forwardRef<HTMLDivElement, Box.Props>((props, ref) => {
    const { render, ...componentProps } = resolveStyles(props);

    return useRenderElement({
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
