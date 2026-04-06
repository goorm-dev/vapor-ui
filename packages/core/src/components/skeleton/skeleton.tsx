import { forwardRef } from 'react';

import { useRenderElement } from '~/hooks/use-render-element';
import { cn } from '~/utils/cn';
import { createSplitProps } from '~/utils/create-split-props';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VaporUIComponentProps } from '~/utils/types';

import type { SkeletonVariants } from './skeleton.css';
import * as styles from './skeleton.css';

/**
 * A placeholder element that indicates content is loading. Renders a `<div>` element.
 */
export const Skeleton = forwardRef<HTMLDivElement, Skeleton.Props>((props, ref) => {
    const { render, className, ...componentProps } = resolveStyles(props);
    const [variantsProps, otherProps] = createSplitProps<SkeletonVariants>()(componentProps, [
        'shape',
        'size',
        'animation',
    ]);

    return useRenderElement({
        ref,
        render,
        defaultTagName: 'div',
        props: {
            className: cn(styles.root(variantsProps), className),
            ...otherProps,
        },
    });
});
Skeleton.displayName = 'Skeleton';

export namespace Skeleton {
    export type State = {};
    export type Props = VaporUIComponentProps<'div', State> & SkeletonVariants;
}
