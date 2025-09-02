import { forwardRef } from 'react';

import { Primitive } from '@radix-ui/react-primitive';
import clsx from 'clsx';

import { createSplitProps } from '~/utils/create-split-props';
import type { VComponentProps } from '~/utils/types';

import type { BadgeVariants } from './badge.css';
import * as styles from './badge.css';

type BadgePrimitiveProps = VComponentProps<typeof Primitive.span>;
interface BadgeProps extends BadgePrimitiveProps, BadgeVariants {
    /**
     * ko: Badge의 색상을 설정합니다.
     * en: Sets the color scheme of the Badge.
     */
    color?: BadgeVariants['color'];

    /**
     * ko: Badge의 크기를 설정합니다.
     * en: Sets the size of the Badge.
     */
    size?: BadgeVariants['size'];

    /**
     * ko: Badge의 모양을 설정합니다.
     * en: Sets the shape of the Badge.
     */
    shape?: BadgeVariants['shape'];
}

/**
 * ko: Badge는 이미지, 컨텐츠 등의 상태 또는 분류를 시각적으로 표시합니다.
 * en: english description
 */
const Badge = forwardRef<HTMLSpanElement, BadgeProps>(({ className, children, ...props }, ref) => {
    const [variantsProps, otherProps] = createSplitProps<BadgeVariants>()(props, [
        'color',
        'size',
        'shape',
    ]);

    return (
        <Primitive.span
            ref={ref}
            className={clsx(styles.root(variantsProps), className)}
            {...otherProps}
        >
            {children}
        </Primitive.span>
    );
});
Badge.displayName = 'Badge';

export { Badge };
export type { BadgeProps };
