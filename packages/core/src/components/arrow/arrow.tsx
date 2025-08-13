'use client';

import type { CSSProperties, ComponentPropsWithoutRef } from 'react';
import { forwardRef, useState } from 'react';

import { useRender } from '@base-ui-components/react/use-render';
import clsx from 'clsx';

import { useMutationObserver } from '~/hooks/use-mutation-observer';
import { vars } from '~/styles/vars.css';
import { composeRefs } from '~/utils/compose-refs';
import type { PositionerProps } from '~/utils/split-positioner-props';

import * as styles from './arrow.css';

/* -------------------------------------------------------------------------------------------------
 * Arrow
 * -----------------------------------------------------------------------------------------------*/

const dataSide = 'data-side';
const dataAlign = 'data-align';

type ArrowPositionProps = Pick<PositionerProps, 'side' | 'align'> & { offset?: number };

interface ArrowProps extends useRender.ComponentProps<'div'>, ArrowPositionProps {
    offset?: number;
}

const Arrow = forwardRef<HTMLDivElement, ArrowProps>(
    (
        {
            render = <div />,
            side: rootSide,
            align: rootAlign,
            offset = 12,
            className,
            children,
            ...props
        },
        ref,
    ) => {
        const [side, setSide] = useState(rootSide);
        const [align, setAlign] = useState(rootAlign);

        const position = getArrowPosition({ side, align, offset });

        const arrowRef = useMutationObserver<HTMLDivElement>({
            callback: (mutations) => {
                mutations.forEach((mutation) => {
                    const { attributeName, target: mutationTarget } = mutation;

                    const dataset = (mutationTarget as HTMLElement).dataset;
                    const nextSide = dataset.side as ArrowPositionProps['side'];
                    const nextAlign = dataset.align as ArrowPositionProps['align'];

                    if (attributeName === dataSide && nextSide) setSide(nextSide);
                    if (attributeName === dataAlign && nextAlign) setAlign(nextAlign);
                });
            },
            options: { attributes: true, attributeFilter: [dataSide, dataAlign] },
        });

        const composedRef = composeRefs(arrowRef, ref);

        return useRender({
            render,
            ref: composedRef,
            props: {
                style: position,
                className: clsx(styles.arrow, className),
                children: children || <ArrowIcon />,
                ...props,
            },
        });

        // return (
        //     <div
        //         ref={composedRef}
        //         style={position}
        //         className={clsx(styles.arrow, className)}
        //         {...props}
        //     >
        //         {children || <ArrowIcon />}
        //     </div>
        // );
    },
);
Arrow.displayName = 'Arrow';

export { Arrow };
export type { ArrowProps };

/* -----------------------------------------------------------------------------------------------*/

const ArrowIcon = (props: ComponentPropsWithoutRef<'svg'>) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="8"
            height="16"
            strokeWidth={0}
            viewBox="0 0 8 16"
            fill="none"
            {...props}
        >
            <path
                d="M1.17969 8.93457C0.620294 8.43733 0.620294 7.56267 1.17969 7.06543L7.25 1.66992L7.25 14.3301L1.17969 8.93457Z"
                stroke={vars.color.border.normal}
                strokeWidth="1"
            />
            <path
                d="M1.8858 7.24074C1.42019 7.63984 1.42019 8.36016 1.8858 8.75926L8 14L8 2L1.8858 7.24074Z"
                strokeWidth={0}
                fill="currentColor"
            />
        </svg>
        // <svg
        //     xmlns="http://www.w3.org/2000/svg"
        //     width="6"
        //     height="16"
        //     viewBox="0 0 6 16"
        //     fill="none"
        //     {...props}
        // >
        //     <path
        //         d="M4.82031 8.93457C5.37971 8.43733 5.37971 7.56267 4.82031 7.06543L-1.25 1.66992L-1.25 14.3301L4.82031 8.93457Z"
        //         stroke={vars.color.border.normal}
        //         strokeWidth="1"
        //     />
        //     <path
        //         d="M4.1142 7.24074C4.57981 7.63984 4.57981 8.36016 4.1142 8.75926L-2 14L-2 2L4.1142 7.24074Z"
        //         fill="currentColor"
        //     />
        // </svg>
    );
};

const getArrowPosition = ({
    side = 'top',
    align = 'center',
    offset = 12,
}: ArrowPositionProps): CSSProperties => {
    const positionMap = {
        'top-start': { left: offset, right: 'unset' },
        'top-end': { left: 'unset', right: offset },
        'bottom-start': { left: offset, right: 'unset' },
        'bottom-end': { left: 'unset', right: offset },
        'left-start': { top: offset, bottom: 'unset' },
        'left-end': { top: 'unset', bottom: offset },
        'right-start': { top: offset, bottom: 'unset' },
        'right-end': { top: 'unset', bottom: offset },
    };

    const key = `${side}-${align}` as keyof typeof positionMap;
    return positionMap[key] || {};
};
