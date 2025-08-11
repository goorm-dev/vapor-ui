import type { CSSProperties, ComponentPropsWithoutRef } from 'react';
import { forwardRef, useState } from 'react';

import { Tooltip as BaseTooltip } from '@base-ui-components/react/tooltip';
import clsx from 'clsx';

import { useMutationObserver } from '~/hooks/use-mutation-observer';
import { createContext } from '~/libs/create-context';
import { createSplitProps } from '~/utils/create-split-props';
import type { OnlyPositionerProps } from '~/utils/split-positioner-props';

// import { splitPositionerProps } from '~/utils/split-positioner-props';

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

type RootPrimitiveProps = ComponentPropsWithoutRef<typeof BaseTooltip.Root>;
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

type TriggerPrimitiveProps = ComponentPropsWithoutRef<typeof BaseTooltip.Trigger>;
interface TooltipTriggerProps extends TriggerPrimitiveProps {}

const Trigger = forwardRef<HTMLButtonElement, TooltipTriggerProps>((props, ref) => {
    return <BaseTooltip.Trigger ref={ref} {...props} />;
});

/* -------------------------------------------------------------------------------------------------
 * Tooltip.Portal
 * -----------------------------------------------------------------------------------------------*/

type PortalPrimitiveProps = ComponentPropsWithoutRef<typeof BaseTooltip.Portal>;
interface TooltipPortalProps extends PortalPrimitiveProps {}

const Portal = (props: TooltipPortalProps) => {
    return <BaseTooltip.Portal {...props} />;
};

/* -------------------------------------------------------------------------------------------------
 * Tooltip.Positioner
 * -----------------------------------------------------------------------------------------------*/

type PositionerPrimitiveProps = ComponentPropsWithoutRef<typeof BaseTooltip.Positioner>;
interface TooltipPositionerProps extends Omit<PositionerPrimitiveProps, keyof TooltipSharedProps> {}

const Positioner = forwardRef<HTMLDivElement, TooltipPositionerProps>(({ ...props }, ref) => {
    const { sideOffset = 6, ...context } = useTooltipContext();

    return (
        <BaseTooltip.Positioner
            ref={ref}
            sideOffset={sideOffset}
            collisionAvoidance={{ align: 'none' }}
            {...context}
            {...props}
        />
    );
});

/* -------------------------------------------------------------------------------------------------
 * Tooltip.Content
 * -----------------------------------------------------------------------------------------------*/

const DATA_SIDE = 'data-side';
const DATA_ALIGN = 'data-align';

type ContentPrimitiveProps = ComponentPropsWithoutRef<typeof BaseTooltip.Popup>;
interface TooltipContentProps extends ContentPrimitiveProps {}

const Content = forwardRef<HTMLDivElement, TooltipContentProps>(
    ({ className, children, ...props }, ref) => {
        const { side: rootSide, align: rootAlign } = useTooltipContext();

        const [side, setSide] = useState(rootSide);
        const [align, setAlign] = useState(rootAlign);

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
            <Positioner>
                <BaseTooltip.Popup ref={ref} className={clsx(styles.content, className)} {...props}>
                    <BaseTooltip.Arrow ref={arrowRef} style={position} className={styles.arrow}>
                        <ArrowIcon />
                    </BaseTooltip.Arrow>

                    {children}
                </BaseTooltip.Popup>
            </Positioner>
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

const ArrowIcon = (props: ComponentPropsWithoutRef<'svg'>) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="8"
            height="17"
            viewBox="0 0 8 17"
            fill="none"
            {...props}
        >
            <path
                d="M-6.99382e-07 16.5L1.43051e-06 0.5L7.32785 7.00518C8.22405 7.80076 8.22405 9.19924 7.32785 9.99482L-6.99382e-07 16.5Z"
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
