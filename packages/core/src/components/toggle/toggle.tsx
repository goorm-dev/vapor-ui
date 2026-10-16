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

/**
 * Two-state button that turns an option on or off, such as bold text formatting. Use alone or inside `ToggleGroup`. Renders a `<button>` element.
 */
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
    export interface Props extends VaporUIComponentProps<typeof BaseToggle, State>, RootVariants {
        /**
         * Content shown inside the toggle, such as an icon. A single element child is hidden from assistive technologies, so give the toggle an `aria-label`.
         */
        children?: BaseToggle.Props['children'];
    }
}
