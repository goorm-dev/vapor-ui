import type { ComponentPropsWithoutRef } from 'react';

import type { useRender } from '@base-ui-components/react/use-render';

export type Assign<T, U> = Omit<T, keyof U> & U;

type OmitColorProp<ElementType extends React.ElementType> =
    string extends ComponentPropsWithoutRef<ElementType>['color'] ? 'color' : never;

export type VComponentProps<ElementType extends React.ElementType> = Omit<
    useRender.ComponentProps<ElementType>,
    OmitColorProp<ElementType>
> & {
    /**
     * CSS class applied to the element, or a function that
     * returns a class based on the component’s state.
     */
    className?: string;
    /**
     * Allows you to replace the component’s HTML element
     * with a different tag, or compose it with another component.
     *
     * Accepts a `ReactElement` or a function that returns the element to render.
     */
    render?: React.ReactElement<Record<string, unknown>>;
};
