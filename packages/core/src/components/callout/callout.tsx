import { forwardRef } from 'react';

import { useRender } from '@base-ui-components/react/use-render';
import clsx from 'clsx';

import { createSplitProps } from '~/utils/create-split-props';
import type { VComponentProps } from '~/utils/types';

import type { CalloutVariants } from './callout.css';
import * as styles from './callout.css';

/* -------------------------------------------------------------------------------------------------
 * CalloutRoot
 * -----------------------------------------------------------------------------------------------*/

type CalloutRootPrimitiveProps = VComponentProps<'div'>;
interface CalloutRootProps extends CalloutRootPrimitiveProps, CalloutVariants {}

/**
 * 중요한 정보나 메시지를 강조하여 사용자의 주의를 끄는 콘텐츠 영역입니다.
 *
 * `<div>` 요소를 렌더링합니다.
 *
 * {@see https://vapor-ui.goorm.io/docs/components/callout Callout Documentation}
 */
const CalloutRoot = forwardRef<HTMLDivElement, CalloutRootProps>(
    ({ render, className, ...props }, ref) => {
        const [variantProps, otherProps] = createSplitProps<CalloutVariants>()(props, ['color']);

        return useRender({
            ref,
            render: render || <div />,
            props: {
                className: clsx(styles.root(variantProps), className),
                ...otherProps,
            },
        });
    },
);
CalloutRoot.displayName = 'CalloutRoot';

/* -------------------------------------------------------------------------------------------------
 * CalloutIcon
 * -----------------------------------------------------------------------------------------------*/

type CalloutIconPrimitiveProps = VComponentProps<'div'>;
interface CalloutIconProps extends CalloutIconPrimitiveProps {}

/**
 * 콜아웃의 아이콘 영역을 담당합니다.
 *
 * `<div>` 요소를 렌더링합니다.
 */
const CalloutIcon = forwardRef<HTMLDivElement, CalloutIconProps>(
    ({ render, className, ...props }, ref) => {
        return useRender({
            ref,
            render: render || <div />,
            props: {
                className: clsx(styles.icon, className),
                ...props,
            },
        });
    },
);
CalloutIcon.displayName = 'CalloutIcon';

/* -------------------------------------------------------------------------------------------------
 * Callout Compound Component
 * -----------------------------------------------------------------------------------------------*/

export const Callout = {
    Root: CalloutRoot,
    Icon: CalloutIcon,
};

export { CalloutRoot, CalloutIcon };
export type { CalloutRootProps, CalloutIconProps };
