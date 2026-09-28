import { forwardRef } from 'react';

import { Toggle as BaseToggle } from '@base-ui/react/toggle';

import { useRenderElement } from '~/hooks/use-render-element';
import { cn } from '~/utils/cn';
import { createRender } from '~/utils/create-renderer';
import { createSplitProps } from '~/utils/create-split-props';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VaporUIComponentProps } from '~/utils/types';

import { useToggleGroupContext } from '../toggle-group/toggle-group';
import * as styles from './toggle.css';
import type { RootVariants } from './toggle.css';

export const Toggle = forwardRef<HTMLButtonElement, Toggle.Props>((props, ref) => {
    const { className, children: childrenProp, ...componentProps } = resolveStyles(props);
    const [variantsProps, otherProps] = createSplitProps<RootVariants>()(componentProps, [
        'size',
        'variant',
    ]);

    const { size: contextSize } = useToggleGroupContext();
    const { size: sizeProp, variant } = variantsProps;

    const size = sizeProp || contextSize;

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
            className={cn(styles.root({ size, variant }), className)}
            {...otherProps}
        >
            {children}
        </BaseToggle>
    );
});
Toggle.displayName = 'Toggle';

/* -----------------------------------------------------------------------------------------------*/

export namespace Toggle {
    export type State = BaseToggle.State;
    export type Props = VaporUIComponentProps<typeof BaseToggle, State> & RootVariants;
}
