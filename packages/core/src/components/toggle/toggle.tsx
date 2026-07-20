import { forwardRef } from 'react';

import { Toggle as BaseToggle } from '@base-ui/react/toggle';
import clsx from 'clsx';

import { useRenderElement } from '~/hooks/use-render-element';
import { createRender } from '~/utils/create-renderer';
import { createSplitProps } from '~/utils/create-split-props';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VaporUIComponentProps } from '~/utils/types';

import { useToggleGroupContext } from '../toggle-group';
import * as styles from './toggle.css';
import type { RootVariants } from './toggle.css';

export const Toggle = forwardRef<HTMLButtonElement, Toggle.Props>((props, ref) => {
    const { className, children: childrenProp, ...componentProps } = resolveStyles(props);
    const [variantsProps, otherProps] = createSplitProps<RootVariants>()(componentProps, [
        'size',
        'variant',
    ]);

    const { size: contextSize, variant: contextVariant } = useToggleGroupContext();
    const { size: sizeProp, variant: variantProp } = variantsProps;

    const size = sizeProp || contextSize;
    const variant = variantProp || contextVariant;

    const childrenRender = createRender(childrenProp);
    const children = useRenderElement({
        render: childrenRender,
        props: {
            'aria-hidden': 'true',
            className: styles.icon,
        },
    });

    return (
        <BaseToggle
            ref={ref}
            className={clsx(styles.root({ size, variant }), className)}
            {...otherProps}
        >
            {children}
        </BaseToggle>
    );
});

/* -----------------------------------------------------------------------------------------------*/

export namespace Toggle {
    export type State = BaseToggle.State;
    export type Props = VaporUIComponentProps<typeof BaseToggle, State> & RootVariants;
}
