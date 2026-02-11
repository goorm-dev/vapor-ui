import { forwardRef } from 'react';

import { useRender } from '@base-ui/react/use-render';
import clsx from 'clsx';

import { createSplitProps } from '~/utils/create-split-props';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VComponentProps } from '~/utils/types';

import type { SkeletonVariants } from './skeleton.css';
import * as styles from './skeleton.css';

/**
 * A placeholder element that indicates content is loading.
 */
export const Skeleton = forwardRef<HTMLDivElement, Skeleton.Props>((props, ref) => {
    const { render, className, ...componentProps } = resolveStyles(props);
    const [variantsProps, otherProps] = createSplitProps<SkeletonVariants>()(componentProps, [
        'shape',
        'size',
        'animation',
    ]);

    return useRender({
        ref,
        render: render || <div />,
        props: {
            className: clsx(styles.root(variantsProps), className),
            ...otherProps,
        },
    });
});
Skeleton.displayName = 'Skeleton';

export namespace Skeleton {
    type SkeletonPrimitiveProps = VComponentProps<'div'>;

    export interface Props extends SkeletonPrimitiveProps, SkeletonVariants {}
}
