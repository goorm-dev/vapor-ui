import type { ComponentPropsWithoutRef } from 'react';

type ColorPropToOmit<ElementType extends React.ElementType> =
    string extends ComponentPropsWithoutRef<ElementType>['color'] ? 'color' : never;

export type VComponentProps<ElementType extends React.ElementType> = Omit<
    ComponentPropsWithoutRef<ElementType>,
    'defaultValue' | 'defaultChecked' | 'dir' | ColorPropToOmit<ElementType>
>;
