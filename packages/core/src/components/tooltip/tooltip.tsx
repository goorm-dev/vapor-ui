import type { ComponentPropsWithoutRef } from 'react';
import { forwardRef } from 'react';

import { Tooltip as BaseTooltip } from '@base-ui-components/react/tooltip';
import clsx from 'clsx';

import { Arrow } from '~/components/arrow';
import { createContext } from '~/libs/create-context';
import { createSplitProps } from '~/utils/create-split-props';
import type { OnlyPositionerProps } from '~/utils/positioner-props';

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
 * Tooltip.Content
 * -----------------------------------------------------------------------------------------------*/

type ContentPrimitiveProps = ComponentPropsWithoutRef<typeof BaseTooltip.Popup>;
interface TooltipContentProps extends ContentPrimitiveProps {}

const Content = forwardRef<HTMLDivElement, TooltipContentProps>(
    ({ className, children, ...props }, ref) => {
        const { sideOffset = 8, ...context } = useTooltipContext();

        return (
            <BaseTooltip.Positioner
                sideOffset={sideOffset}
                collisionAvoidance={{ align: 'none' }}
                {...context}
            >
                <BaseTooltip.Popup ref={ref} className={clsx(styles.content, className)} {...props}>
                    <Arrow
                        render={<BaseTooltip.Arrow />}
                        side={context.side}
                        align={context.align}
                        offset={6}
                        className={styles.arrow}
                    />

                    {children}
                </BaseTooltip.Popup>
            </BaseTooltip.Positioner>
        );
    },
);

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
