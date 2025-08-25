'use client';

import type { CSSProperties } from 'react';
import { forwardRef, useState } from 'react';

import { Tooltip as BaseTooltip } from '@base-ui-components/react/tooltip';
import clsx from 'clsx';

import { useMutationObserver } from '~/hooks/use-mutation-observer';
import { createContext } from '~/libs/create-context';
import { vars } from '~/styles/vars.css';
import { createSplitProps } from '~/utils/create-split-props';
import type { OnlyPositionerProps } from '~/utils/positioner-props';
import type { VComponentProps } from '~/utils/types';

import * as styles from './tooltip.css';

/* -----------------------------------------------------------------------------------------------*/

type PositionerProps = OnlyPositionerProps<typeof BaseTooltip.Positioner>;

type TooltipSharedProps = PositionerProps;
type TooltipContext = TooltipSharedProps;

const [TooltipProvider, useTooltipContext] = createContext<TooltipContext>({
    name: 'Tooltip',
    hookName: 'useTooltipContext',
    providerName: 'TooltipProvider',
});

/* -------------------------------------------------------------------------------------------------
 * Tooltip.Root
 * -----------------------------------------------------------------------------------------------*/

type RootPrimitiveProps = VComponentProps<typeof BaseTooltip.Root>;
interface TooltipRootProps extends RootPrimitiveProps, TooltipSharedProps {}

const Root = (props: TooltipRootProps) => {
    const [sharedProps, otherProps] = createSplitProps<PositionerProps>()(props, [
        'align',
        'alignOffset',
        'side',
        'sideOffset',
        'anchor',
        'arrowPadding',
        'collisionAvoidance',
        'collisionBoundary',
        'collisionPadding',
        'positionMethod',
        'sticky',
        'trackAnchor',
    ]);

    return (
        <TooltipProvider value={sharedProps}>
            <BaseTooltip.Root {...otherProps} />
        </TooltipProvider>
    );
};

/* -------------------------------------------------------------------------------------------------
 * Tooltip.Trigger
 * -----------------------------------------------------------------------------------------------*/

type TriggerPrimitiveProps = VComponentProps<typeof BaseTooltip.Trigger>;
interface TooltipTriggerProps extends TriggerPrimitiveProps {}

const Trigger = forwardRef<HTMLButtonElement, TooltipTriggerProps>((props, ref) => {
    return <BaseTooltip.Trigger ref={ref} {...props} />;
});

/* -------------------------------------------------------------------------------------------------
 * Tooltip.Portal
 * -----------------------------------------------------------------------------------------------*/

type PortalPrimitiveProps = VComponentProps<typeof BaseTooltip.Portal>;
interface TooltipPortalProps extends PortalPrimitiveProps {}

const Portal = (props: TooltipPortalProps) => {
    return <BaseTooltip.Portal {...props} />;
};

/* -------------------------------------------------------------------------------------------------
 * Tooltip.Content
 * -----------------------------------------------------------------------------------------------*/

const DATA_SIDE = 'data-side';
const DATA_ALIGN = 'data-align';

type ContentPrimitiveProps = VComponentProps<typeof BaseTooltip.Popup>;
interface TooltipContentProps extends ContentPrimitiveProps {}

const Content = forwardRef<HTMLDivElement, TooltipContentProps>(
    ({ className, children, ...props }, ref) => {
        const { sideOffset = 6, ...context } = useTooltipContext();

        const [side, setSide] = useState(context.side);
        const [align, setAlign] = useState(context.align);

        const position = getArrowPosition({ side, align, offset: 6 });

        const arrowRef = useMutationObserver<HTMLDivElement>({
            callback: (mutations) => {
                mutations.forEach((mutation) => {
                    const { attributeName, target: mutationTarget } = mutation;

                    const dataset = (mutationTarget as HTMLElement).dataset;
                    const nextSide = dataset.side as PositionerProps['side'];
                    const nextAlign = dataset.align as PositionerProps['align'];

                    if (attributeName === DATA_SIDE && nextSide) setSide(nextSide);
                    if (attributeName === DATA_ALIGN && nextAlign) setAlign(nextAlign);
                });
            },
            options: { attributes: true, attributeFilter: [DATA_SIDE, DATA_ALIGN] },
        });

        return (
            <BaseTooltip.Positioner
                sideOffset={sideOffset}
                collisionAvoidance={{ align: 'none' }}
                {...context}
            >
                <BaseTooltip.Popup ref={ref} className={clsx(styles.content, className)} {...props}>
                    <BaseTooltip.Arrow ref={arrowRef} style={position} className={styles.arrow}>
                        <ArrowIcon />
                    </BaseTooltip.Arrow>

                    {children}
                </BaseTooltip.Popup>
            </BaseTooltip.Positioner>
        );
    },
);

/* -----------------------------------------------------------------------------------------------*/

type ArrowPositionProps = Pick<PositionerProps, 'side' | 'align'> & { offset?: number };

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

/* -----------------------------------------------------------------------------------------------*/

const ArrowIcon = (props: VComponentProps<'svg'>) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="8"
            height="16"
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
                fill="currentColor"
            />
        </svg>
    );
};

/* -----------------------------------------------------------------------------------------------*/

export {
    Root as TooltipRoot,
    Trigger as TooltipTrigger,
    Portal as TooltipPortal,
    Content as TooltipContent,
};

export type { TooltipRootProps, TooltipTriggerProps, TooltipPortalProps, TooltipContentProps };

export const Tooltip = {
    Root,
    Trigger,
    Portal,
    Content,
};
