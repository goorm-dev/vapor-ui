import { forwardRef } from 'react';

import { useRender } from '@base-ui-components/react/use-render';
import clsx from 'clsx';

import { createSplitProps } from '~/utils/create-split-props';
import type { VComponentProps } from '~/utils/types';

import type { BadgeVariants } from './badge.css';
import * as styles from './badge.css';

type BadgePrimitiveProps = VComponentProps<'span'>;
interface BadgeProps extends BadgePrimitiveProps, BadgeVariants {}

/**
 * 이미지, 콘텐츠 등의 상태 또는 분류를 시각적으로 표시합니다.
 * `span` 태그를 기본으로 사용합니다.
 *
 * {@see https://vapor-ui.goorm.io/docs/components/badge Badge Documentation}
 */

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(({ render, className, ...props }, ref) => {
    const [variantsProps, otherProps] = createSplitProps<BadgeVariants>()(props, [
        'color',
        'size',
        'shape',
    ]);

    return useRender({
        ref,
        render: render || <span />,
        props: {
            className: clsx(styles.root(variantsProps), className),
            ...otherProps,
        },
    });
});
Badge.displayName = 'Badge';

export { Badge };
export type { BadgeProps };
