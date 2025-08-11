import type { ComponentPropsWithoutRef } from 'react';
import { forwardRef } from 'react';

import { Tooltip as BaseTooltip } from '@base-ui-components/react/tooltip';
import clsx from 'clsx';

import { Arrow } from '~/components/arrow';
import { createContext } from '~/libs/create-context';
import type { PositionerProps } from '~/utils/split-positioner-props';
import { splitPositionerProps } from '~/utils/split-positioner-props';

import * as styles from './tooltip.css';

/* -------------------------------------------------------------------------------------------------
 * Tooltip.Provider
 * -----------------------------------------------------------------------------------------------*/

type ProviderPrimitiveProps = ComponentPropsWithoutRef<typeof BaseTooltip.Provider>;
interface TooltipProviderProps extends ProviderPrimitiveProps {}

const Provider = (props: TooltipProviderProps) => {
    return <BaseTooltip.Provider {...props} />;
};

/* -----------------------------------------------------------------------------------------------*/

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

type ContentPrimitiveProps = ComponentPropsWithoutRef<typeof BaseTooltip.Popup>;
interface TooltipContentProps extends ContentPrimitiveProps {}

const Content = forwardRef<HTMLDivElement, TooltipContentProps>(
    ({ className, children, ...props }, ref) => {
        const { side, align } = useTooltipContext();

        return (
            <BaseTooltip.Popup ref={ref} className={clsx(styles.content, className)} {...props}>
                <Arrow
                    render={<BaseTooltip.Arrow />}
                    side={side}
                    align={align}
                    offset={8}
                    className={styles.arrow}
                />

                {children}
            </BaseTooltip.Popup>
        );
    },
);

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
