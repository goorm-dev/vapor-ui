import type { ComponentPropsWithoutRef } from 'react';

type ColorPropToOmit<ElementType extends React.ElementType> =
    string extends ComponentPropsWithoutRef<ElementType>['color'] ? 'color' : never;

export type VComponentProps<ElementType extends React.ElementType> = Omit<
    ComponentPropsWithoutRef<ElementType>,
    'defaultValue' | 'defaultChecked' | 'dir' | ColorPropToOmit<ElementType> | 'className'
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
