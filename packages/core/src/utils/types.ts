import type { ComponentPropsWithoutRef } from 'react';

import type { ComponentRenderFn, HTMLProps } from '@base-ui/react/types';
import type { useRender } from '@base-ui/react/use-render';

import type { Sprinkles } from '~/styles/sprinkles.css';

import type { ClassNameParams, StyleParams } from './stateful-props';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyProp = any;

export type Assign<T, U> = Omit<T, keyof U> & U;

type OmitColorProp<ElementType extends React.ElementType> =
    string extends ComponentPropsWithoutRef<ElementType>['color'] ? 'color' : never;

type CssProps = Sprinkles;

export type Styles = {
    /**
     * @deprecated
     * @vapor-ui/style-macro를 사용해주세요.
     *
     * @example
     * import { css } from '@vapor-ui/style-macro';
     * <Button className={css({ backgroundColor: '$bg-primary', gap: '$space-100'  })} />
     */
    $css?: CssProps;
};

export type VaporUIComponentProps<ElementType extends React.ElementType, State> = Styles &
    Omit<
        useRender.ComponentProps<ElementType, State>,
        OmitColorProp<ElementType> | 'className' | 'style' | 'render'
    > & {
        /**
         * CSS class applied to the element, or a function that returns a class based on the component’s state.
         */
        className?: ClassNameParams<State>;
        /**
         * Style applied to the element, or a function that returns a style object based on the component’s state.
         */
        style?: StyleParams<State>;
        /**
         * Allows you to replace the component’s HTML element with a different tag, or compose it with another component.
         * Accepts a ReactElement or a function that returns the element to render.
         */
        render?: React.ReactElement | ComponentRenderFn<HTMLProps, State>;
    };
