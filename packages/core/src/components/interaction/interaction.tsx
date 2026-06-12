import { Children, cloneElement, isValidElement } from 'react';
import type { ReactNode } from 'react';

import { cn } from '~/utils/cn';

import * as styles from './interaction.css';

interface InteractionProps {
    className?: string;
    children: ReactNode;
}

const Interaction = (props: InteractionProps) => {
    const { className, children } = props;
    const child = Children.only(children);

    if (!isValidElement<{ className?: string }>(child)) {
        throw new Error('<Interaction> child must be a single React element');
    }

    return cloneElement(child, {
        className: cn(styles.root({}), className, child.props.className),
    });
};

Interaction.displayName = 'Interaction';

export { Interaction };
export type { InteractionProps };
