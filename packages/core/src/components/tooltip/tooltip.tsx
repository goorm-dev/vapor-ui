'use client';

import type { ComponentProps, ReactElement } from 'react';
import { forwardRef } from 'react';

import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';

import { useRenderElement } from '~/hooks/use-render-element';
import { cn } from '~/utils/cn';
import { createRender } from '~/utils/create-renderer';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VaporUIComponentProps } from '~/utils/types';

import * as styles from './tooltip.css';

/* -------------------------------------------------------------------------------------------------
 * Tooltip.Root
 * -----------------------------------------------------------------------------------------------*/

/**
 * Root of the Tooltip compound component, which shows a short label for an element on hover or focus. Manages the open state. Doesn't render its own HTML element.
 */
export const TooltipRoot = (props: TooltipRoot.Props) => {
    return <BaseTooltip.Root {...props} />;
};

/* -------------------------------------------------------------------------------------------------
 * Tooltip.Trigger
 * -----------------------------------------------------------------------------------------------*/

/**
 * Element that opens the tooltip when hovered or focused. Renders a `<button>` element.
 */
export const TooltipTrigger = forwardRef<HTMLButtonElement, TooltipTrigger.Props>((props, ref) => {
    const componentProps = resolveStyles(props);

    return <BaseTooltip.Trigger ref={ref} {...componentProps} />;
});
TooltipTrigger.displayName = 'Tooltip.Trigger';

/* -------------------------------------------------------------------------------------------------
 * Tooltip.PortalPrimitive
 * -----------------------------------------------------------------------------------------------*/

/**
 * Portal container that renders the tooltip outside the normal DOM hierarchy. Renders a `<div>` element.
 */
export const TooltipPortalPrimitive = forwardRef<HTMLDivElement, TooltipPortalPrimitive.Props>(
    (props, ref) => {
        const componentProps = resolveStyles(props);

        return <BaseTooltip.Portal ref={ref} {...componentProps} />;
    },
);
TooltipPortalPrimitive.displayName = 'Tooltip.PortalPrimitive';

/* -------------------------------------------------------------------------------------------------
 * Tooltip.PositionerPrimitive
 * -----------------------------------------------------------------------------------------------*/

/**
 * Positions the tooltip popup against its trigger and keeps it inside the viewport. Renders a `<div>` element.
 */
export const TooltipPositionerPrimitive = forwardRef<
    HTMLDivElement,
    TooltipPositionerPrimitive.Props
>((props, ref) => {
    const {
        side = 'top',
        align = 'center',
        sideOffset = 10,
        collisionAvoidance,
        ...componentProps
    } = resolveStyles(props);

    return (
        <BaseTooltip.Positioner
            ref={ref}
            side={side}
            align={align}
            sideOffset={sideOffset}
            collisionAvoidance={{ align: 'none', ...collisionAvoidance }}
            {...componentProps}
        />
    );
});
TooltipPositionerPrimitive.displayName = 'Tooltip.PositionerPrimitive';

/* -------------------------------------------------------------------------------------------------
 * Tooltip.PopupPrimitive
 * -----------------------------------------------------------------------------------------------*/

/**
 * The tooltip panel, with an arrow that points at the trigger. Renders a `<div>` element.
 */
export const TooltipPopupPrimitive = forwardRef<HTMLDivElement, TooltipPopupPrimitive.Props>(
    (props, ref) => {
        const { className, children, ...componentProps } = resolveStyles(props);

        return (
            <BaseTooltip.Popup
                ref={ref}
                className={cn(styles.popup, className)}
                {...componentProps}
            >
                <BaseTooltip.Arrow className={styles.arrow}>
                    <ArrowIcon />
                </BaseTooltip.Arrow>

                {children}
            </BaseTooltip.Popup>
        );
    },
);
TooltipPopupPrimitive.displayName = 'Tooltip.PopupPrimitive';

/* -------------------------------------------------------------------------------------------------
 * Tooltip.Popup
 * -----------------------------------------------------------------------------------------------*/

/**
 * Combines `Tooltip.PortalPrimitive`, `Tooltip.PositionerPrimitive`, and `Tooltip.PopupPrimitive` into a single part. Use `portalElement` or `positionerElement` to replace the portal or positioner. Renders a `<div>` element.
 */
export const TooltipPopup = forwardRef<HTMLDivElement, TooltipPopup.Props>(
    ({ portalElement, positionerElement, ...props }, ref) => {
        const popup = <TooltipPopupPrimitive ref={ref} {...props} />;

        const positionerRender = createRender(positionerElement, <TooltipPositionerPrimitive />);
        const positioner = useRenderElement({
            render: positionerRender,
            props: { children: popup },
        });

        const portalRender = createRender(portalElement, <TooltipPortalPrimitive />);
        const portal = useRenderElement({
            render: portalRender,
            props: { children: positioner },
        });

        return portal;
    },
);
TooltipPopup.displayName = 'Tooltip.Popup';

/* -----------------------------------------------------------------------------------------------*/

const ArrowIcon = (props: ComponentProps<'svg'>) => {
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
                d="M1.8858 7.24074C1.42019 7.63984 1.42019 8.36016 1.8858 8.75926L8 14L8 2L1.8858 7.24074Z"
                fill="currentColor"
            />
        </svg>
    );
};

/* -----------------------------------------------------------------------------------------------*/

export namespace TooltipRoot {
    export type State = BaseTooltip.Root.State;
    export type Props = BaseTooltip.Root.Props;

    export type Actions = BaseTooltip.Root.Actions;
    export type ChangeEventDetails = BaseTooltip.Root.ChangeEventDetails;
}

export namespace TooltipTrigger {
    export type State = BaseTooltip.Trigger.State;
    export type Props = VaporUIComponentProps<typeof BaseTooltip.Trigger, State>;
}

export namespace TooltipPortalPrimitive {
    export type State = BaseTooltip.Portal.State;
    export type Props = VaporUIComponentProps<typeof BaseTooltip.Portal, State>;
}

export namespace TooltipPositionerPrimitive {
    export type State = BaseTooltip.Positioner.State;
    export type Props = VaporUIComponentProps<typeof BaseTooltip.Positioner, State>;
}

export namespace TooltipPopupPrimitive {
    export type State = BaseTooltip.Popup.State;
    export type Props = VaporUIComponentProps<typeof BaseTooltip.Popup, State>;
}

export interface TooltipPopupProps extends TooltipPopupPrimitive.Props {
    /**
     * Replaces the default `Tooltip.PortalPrimitive`. Use to change the portal container.
     */
    portalElement?: ReactElement<TooltipPortalPrimitive.Props>;
    /**
     * Replaces the default `Tooltip.PositionerPrimitive`. Use to change the side, alignment, or offset of the popup.
     */
    positionerElement?: ReactElement<TooltipPositionerPrimitive.Props>;
}

export namespace TooltipPopup {
    export type State = TooltipPopupPrimitive.State;
    export type Props = TooltipPopupProps;
}
