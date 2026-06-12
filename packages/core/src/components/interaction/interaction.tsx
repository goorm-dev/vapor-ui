import { Children, cloneElement, isValidElement } from 'react';
import type { ReactNode } from 'react';

import { cn } from '~/utils/cn';
import { createSplitProps } from '~/utils/create-split-props';

import * as styles from './interaction.css';
import type { InteractionVariants } from './interaction.css';

interface InteractionProps extends InteractionVariants {
    className?: string;
    children: ReactNode;
}

const Interaction = (props: InteractionProps) => {
    const [variantProps, { className, children }] = createSplitProps<InteractionVariants>()(
        props,
        ['scale', 'type'],
    );

    const child = Children.only(children);

    if (!isValidElement<{ className?: string }>(child)) {
        throw new Error('<Interaction> child must be a single React element');
    }

    return cloneElement(child, {
        className: cn(styles.root(variantProps), className, child.props.className),
    });
};

Interaction.displayName = 'Interaction';

export { Interaction };
export type { InteractionProps };
