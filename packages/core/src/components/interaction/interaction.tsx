import { Children, cloneElement, isValidElement } from 'react';
import type { ReactNode } from 'react';

interface InteractionProps {
    children: ReactNode;
}

const Interaction = (props: InteractionProps) => {
    const child = Children.only(props.children);

    if (!isValidElement<{ className?: string }>(child)) {
        throw new Error('<Interaction> child must be a single React element');
    }

    return cloneElement(child);
};

Interaction.displayName = 'Interaction';

export { Interaction };
export type { InteractionProps };
