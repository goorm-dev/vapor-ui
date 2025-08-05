import { type ComponentPropsWithoutRef, forwardRef } from 'react';

import { Tooltip as BaseTooltip } from '@base-ui-components/react/tooltip';
import clsx from 'clsx';

import { createContext } from '~/libs/create-context';
import { type PositionerProps, splitPositionerProps } from '~/utils/split-positioner-props';

import * as styles from './tooltip.css';
import type { TooltipArrowVariants } from './tooltip.css';

/* -------------------------------------------------------------------------------------------------
 * Tooltip.Provider
 * -----------------------------------------------------------------------------------------------*/

type ProviderPrimitiveProps = ComponentPropsWithoutRef<typeof BaseTooltip.Provider>;
interface TooltipProviderProps extends ProviderPrimitiveProps {}

const Provider = (props: TooltipProviderProps) => {
    return <BaseTooltip.Provider {...props} />;
};

/* -----------------------------------------------------------------------------------------------*/

type TooltipVariants = TooltipArrowVariants;
type TooltipSharedProps = TooltipVariants & PositionerProps;
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
    const [sharedProps, otherProps] = splitPositionerProps<TooltipSharedProps>(props);

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
    const { side, align, sideOffset = 8, alignOffset } = useTooltipContext();

    return (
        <BaseTooltip.Positioner
            ref={ref}
            side={side}
            align={align}
            sideOffset={sideOffset}
            alignOffset={alignOffset}
            {...props}
        />
    );
});

/* -------------------------------------------------------------------------------------------------
 * Tooltip.Content
 * -----------------------------------------------------------------------------------------------*/

type ContentPrimitiveProps = ComponentPropsWithoutRef<typeof BaseTooltip.Popup>;
interface TooltipContentProps extends ContentPrimitiveProps {}

const Content = forwardRef<HTMLDivElement, TooltipContentProps>(
    ({ className, children, ...props }, ref) => {
        const { side } = useTooltipContext();

        return (
            <BaseTooltip.Popup ref={ref} className={clsx(styles.content, className)} {...props}>
                <BaseTooltip.Arrow className={styles.arrow({ side })}>
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
                fill="currentColor"
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
