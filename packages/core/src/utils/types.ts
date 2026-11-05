import type * as React from 'react';

import type { ComponentRenderFn, HTMLProps } from '@base-ui/react/types';
import type { useRender } from '@base-ui/react/use-render';

import type { Sprinkles } from '~/styles/sprinkles.css';

import type { ClassNameParams, StyleParams } from './stateful-props';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyProp = any;

export type Assign<T, U> = Omit<T, keyof U> & U;

type OmitColorProp<ElementType extends React.ElementType> =
    string extends React.ComponentPropsWithoutRef<ElementType>['color'] ? 'color' : never;

type CssProps = Sprinkles;

export type Styles = {
    /**
     * Sprinkles 기반 유틸리티 스타일 prop. 지금도 그대로 사용할 수 있지만, 향후
     * 컴파일 타임 atomic CSS 로 동작하는 `@vapor-ui/style-macro` 의 `css()` 매크로
     * 로 전환될 예정이다. 매크로가 아직 도그푸딩 중이라 한동안 두 방식이 공존한다.
     *
     * @example
     * // 지금 쓸 수 있는 방식
     * <Button $css={{ backgroundColor: '$bg-primary', gap: '$100' }} />
     *
     * // 앞으로 권장될 방식 (매크로 안정화 이후)
     * import { css } from '@vapor-ui/style-macro';
     * <Button className={css({ backgroundColor: '$bg-primary', gap: '$space-100' })} />
     */
    $css?: CssProps;
};

export type VaporUIComponentProps<ElementType extends React.ElementType, State> = Styles &
    Omit<
        useRender.ComponentProps<ElementType, State>,
        OmitColorProp<ElementType> | 'className' | 'style' | 'render'
    > & {
        /**
         * CSS class applied to the element, or a function that
         * returns a class based on the component's state.
         */
        className?: ClassNameParams<State>;
        /**
         * Style applied to the element, or a function that
         * returns a style object based on the component's state.
         */
        style?: StyleParams<State>;
        /**
         * Allows you to replace the component's HTML element
         * with a different tag, or compose it with another component.
         *
         * Accepts a `ReactElement` or a function that returns the element to render.
         */
        render?: React.ReactElement | ComponentRenderFn<HTMLProps, State>;
    };
