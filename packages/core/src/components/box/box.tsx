import { forwardRef } from 'react';

import { useRender } from '@base-ui-components/react/use-render';

import { resolveStyles } from '~/utils/resolve-styles';
import type { VComponentProps } from '~/utils/types';

/**
 * 스타일링 가능한 기본 레이아웃 컴포넌트
 */
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
