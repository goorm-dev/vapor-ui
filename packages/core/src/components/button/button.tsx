import { forwardRef } from 'react';

import { useRender } from '@base-ui-components/react/use-render';
import clsx from 'clsx';

import { createSplitProps } from '~/utils/create-split-props';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VComponentProps } from '~/utils/types';

import type { ButtonVariants } from './button.css';
import * as styles from './button.css';

/**
 * 버튼 컴포넌트는 사용자가 클릭할 수 있는 인터랙티브한 요소로, 다양한 스타일과 크기로 제공되어 사용자 인터페이스에서 중요한 역할을 합니다. `<button>` 요소를 렌더링 합니다.
 */
export const Button = forwardRef<HTMLButtonElement, Button.Props>((props, ref) => {
    const { render, className, ...componentProps } = resolveStyles(props);
    const [variantsProps, otherProps] = createSplitProps<ButtonVariants>()(componentProps, [
        'colorPalette',
        'size',
        'variant',
    ]);

    const { disabled } = otherProps;

    return useRender({
        ref,
        state: { disabled },
        render: render || <button />,
        props: {
            className: clsx(styles.root(variantsProps), className),
            ...otherProps,
        },
    });
});
Button.displayName = 'Button';

export namespace Button {
    type ButtonPrimitiveProps = VComponentProps<'button'>;

    export interface Props extends ButtonPrimitiveProps, ButtonVariants {}
}
