import type { ComponentPropsWithoutRef } from 'react';

import type { useRender } from '@base-ui-components/react/use-render';

export type Assign<T, U> = Omit<T, keyof U> & U;

type OmitColorProp<ElementType extends React.ElementType> =
    string extends ComponentPropsWithoutRef<ElementType>['color'] ? 'color' : never;

export type VComponentProps<ElementType extends React.ElementType> = Omit<
    useRender.ComponentProps<ElementType>,
    OmitColorProp<ElementType>
>;
