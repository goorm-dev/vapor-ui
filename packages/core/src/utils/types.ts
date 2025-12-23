import type { ComponentPropsWithoutRef } from 'react';

import type { useRender } from '@base-ui-components/react/use-render';

import type { Sprinkles } from '~/styles/sprinkles.css';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyProp = any;

export type Assign<T, U> = Omit<T, keyof U> & U;

type OmitColorProp<ElementType extends React.ElementType> =
    string extends ComponentPropsWithoutRef<ElementType>['color'] ? 'color' : never;

export type VComponentProps<ElementType extends React.ElementType> = Sprinkles &
    Omit<useRender.ComponentProps<ElementType>, OmitColorProp<ElementType>>;
