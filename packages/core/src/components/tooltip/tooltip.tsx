import { type ComponentPropsWithoutRef, forwardRef } from 'react';

import { Tooltip as BaseTooltip } from '@base-ui-components/react/tooltip';
import clsx from 'clsx';

import * as styles from './tooltip.css';

/* -------------------------------------------------------------------------------------------------
 * Tooltip.Provider
 * -----------------------------------------------------------------------------------------------*/

type ProviderPrimitiveProps = ComponentPropsWithoutRef<typeof BaseTooltip.Provider>;
interface TooltipProviderProps extends ProviderPrimitiveProps {}

const Provider = (props: TooltipProviderProps) => {
    return <BaseTooltip.Provider {...props} />;
};

/* -------------------------------------------------------------------------------------------------
 * Tooltip.Root
 * -----------------------------------------------------------------------------------------------*/

type RootPrimitiveProps = ComponentPropsWithoutRef<typeof BaseTooltip.Root>;
interface TooltipRootProps extends RootPrimitiveProps {}

const Root = (props: TooltipRootProps) => {
    return <BaseTooltip.Root {...props} />;
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
interface TooltipPositionerProps extends PositionerPrimitiveProps {}

const Positioner = forwardRef<HTMLDivElement, TooltipPositionerProps>(
    ({ sideOffset = 8, ...props }, ref) => {
        return <BaseTooltip.Positioner ref={ref} sideOffset={sideOffset} {...props} />;
    },
);

/* -------------------------------------------------------------------------------------------------
 * Tooltip.Content
 * -----------------------------------------------------------------------------------------------*/

type ContentPrimitiveProps = ComponentPropsWithoutRef<typeof BaseTooltip.Popup>;
interface TooltipContentProps extends ContentPrimitiveProps {}

const Content = forwardRef<HTMLDivElement, TooltipContentProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <BaseTooltip.Popup ref={ref} className={clsx(styles.content, className)} {...props}>
                <BaseTooltip.Arrow className={styles.arrow}>
                    <ArrowIcon />
                </BaseTooltip.Arrow>

                {children}
            </BaseTooltip.Popup>
        );
    },
);

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
                fill="canvas"
            />
        </svg>
    );
};

/* -----------------------------------------------------------------------------------------------*/

export {
    Provider as TooltipProvider,
    Root as TooltipRoot,
    Trigger as TooltipTrigger,
    Portal as TooltipPortal,
    Positioner as TooltipPositioner,
    Content as TooltipContent,
};

export type {
    TooltipProviderProps,
    TooltipRootProps,
    TooltipTriggerProps,
    TooltipPortalProps,
    TooltipPositionerProps,
    TooltipContentProps,
};

export const Tooltip = {
    Provider,
    Root,
    Trigger,
    Portal,
    Positioner,
    Content,
};
