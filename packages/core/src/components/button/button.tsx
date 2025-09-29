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
 * 양식 제출이나 특정 작업을 실행하는 데 사용되는 클릭 가능한 버튼입니다.
 *
 * `<button>` 요소를 렌더링합니다.
 *
 * {@see https://vapor-ui.goorm.io/docs/components/button Button Documentation}
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
