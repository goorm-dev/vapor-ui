import { Children, Fragment, cloneElement, isValidElement } from 'react';

import { useRenderElement } from '~/hooks/use-render-element';
import { cn } from '~/utils/cn';
import { createSplitProps } from '~/utils/create-split-props';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VaporUIComponentProps } from '~/utils/types';

import * as styles from './interaction.css';
import type { InteractionVariants } from './interaction.css';

/* -------------------------------------------------------------------------------------------------
 * Interaction
 * -----------------------------------------------------------------------------------------------*/

export const Interaction = (props: Interaction.Props) => {
    const {
        className: classNameProp,
        children: childrenProp,
        ...componentProps
    } = resolveStyles(props);

    const [variantProps, otherProps] = createSplitProps<InteractionVariants>()(componentProps, [
        'scale',
        'type',
    ]);

    const child = Children.only(childrenProp);

    if (!isValidElement<Interaction.Props>(child)) {
        throw new Error('<Interaction> child must be a single React element');
    }

    const element = useRenderElement({
        defaultTagName: 'div',
        state: { interaction: true },
        props: {
            role: 'presentation',
            'aria-hidden': 'true',
            className: cn(styles.overlay, classNameProp),
            ...otherProps,
        },
    });

    const { type } = variantProps;
    const { className, children } = child.props;

    return cloneElement(child, {
        className: cn(styles.root(variantProps), className),
        children:
            type === 'form' ? (
                children
            ) : (
                <Fragment>
                    {element}
                    {children}
                </Fragment>
            ),
    });
};

/* -----------------------------------------------------------------------------------------------*/

export namespace Interaction {
    export type State = {};
    export type Props = VaporUIComponentProps<'div', State> & InteractionVariants;
}
