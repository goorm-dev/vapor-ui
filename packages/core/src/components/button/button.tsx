import { forwardRef } from 'react';

import { useRender } from '@base-ui-components/react/use-render';
import clsx from 'clsx';

import { createSplitProps } from '~/utils/create-split-props';
import type { VComponentProps } from '~/utils/types';

import type { ButtonVariants } from './button.css';
import * as styles from './button.css';

type ButtonPrimitiveProps = VComponentProps<'button'>;
interface ButtonProps extends ButtonPrimitiveProps, ButtonVariants {}

/**
 * Button 컴포넌트는 사용자가 클릭할 수 있는 인터랙티브한 요소입니다.
 * button 태그를 기본으로 사용합니다.
 *
 * {@see https://vapor-ui.goorm.io/docs/components/button Button Documentation}
 *
 * @param color - 버튼의 색상 테마를 설정합니다.
 * @param size - 버튼의 크기를 설정합니다.
 * @param variant - 버튼의 스타일 변형을 설정합니다.
 * @param stretch - true로 설정하면 버튼이 부모 컨테이너의 전체 너비를 차지합니다.
 * @param disabled - true로 설정하면 버튼이 비활성화됩니다.
 */

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ render, className, ...props }, ref) => {
        const [variantsProps, otherProps] = createSplitProps<ButtonVariants>()(props, [
            'color',
            'size',
            'variant',
            'stretch',
        ]);

        return useRender({
            ref,
            render: render || <button />,
            props: {
                'data-disabled': otherProps.disabled,
                className: clsx(styles.root(variantsProps), className),
                ...otherProps,
            },
        });
    },
);
Button.displayName = 'Button';

export { Button };
export type { ButtonProps };
