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
     * 요소에 적용된 CSS 클래스 또는 컴포넌트의 상태에 따라 클래스를 반환하는 함수.
     */
    className?: string;
    /**
     * 구성 요소의 HTML 요소를 다른 태그로 교체하거나 다른 구성 요소와 조합할 수 있게 합니다.
     
     *
     * 렌더링할 요소를 반환하는 `ReactElement` 또는 함수를 받아들입니다.
     */
    render?: React.ReactElement<Record<string, unknown>>;
};
