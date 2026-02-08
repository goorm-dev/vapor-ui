import type { useRender } from '@base-ui/react/use-render';

import type { Sprinkles } from '~/styles/sprinkles.css';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyProp = any;

export type Assign<T, U> = Omit<T, keyof U> & U;

export type Styles = { $styles?: Sprinkles };

export type VComponentProps<ElementType extends React.ElementType> =
    useRender.ComponentProps<ElementType> & Styles;
