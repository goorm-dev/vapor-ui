'use client';

import type { ComponentProps, ReactElement, RefObject } from 'react';
import { forwardRef, useEffect, useRef, useState } from 'react';

import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';

import { getArrowSideStyle, useArrowPosition } from '~/hooks/use-arrow-position';
import { useIsoLayoutEffect } from '~/hooks/use-iso-layout-effect';
import { useMutationObserverRef } from '~/hooks/use-mutation-observer-ref';
import { useRenderElement } from '~/hooks/use-render-element';
import { createContext } from '~/libs/create-context';
import { cn } from '~/utils/cn';
import { composeRefs } from '~/utils/compose-refs';
import { createRender } from '~/utils/create-renderer';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VaporUIComponentProps } from '~/utils/types';

import * as styles from './tooltip.css';

/* -------------------------------------------------------------------------------------------------
 * TooltipArrowContext (internal)
 * -----------------------------------------------------------------------------------------------*/

interface TooltipArrowContextValue {
    triggerRef: RefObject<Element | null>;
    positionerRef: RefObject<HTMLElement | null>;
    arrowPadding: number;
    setArrowPadding: React.Dispatch<React.SetStateAction<number>>;
}

const [TooltipArrowProvider, useTooltipArrowContext] = createContext<TooltipArrowContextValue>({
    name: 'TooltipArrowContext',
    strict: false,
    hookName: 'useTooltipArrowContext',
    providerName: 'TooltipRoot',
});

const DEFAULT_TOOLTIP_ARROW_PADDING = 8;

/* -------------------------------------------------------------------------------------------------
 * Tooltip.Root
 * -----------------------------------------------------------------------------------------------*/

export const TooltipRoot = (props: TooltipRoot.Props) => {
    const triggerRef = useRef<Element>(null);
    const positionerRef = useRef<HTMLElement>(null);
    const [arrowPadding, setArrowPadding] = useState(DEFAULT_TOOLTIP_ARROW_PADDING);

    return (
        <TooltipArrowProvider value={{ triggerRef, positionerRef, arrowPadding, setArrowPadding }}>
            <BaseTooltip.Root {...props} />
        </TooltipArrowProvider>
    );
};

/* -------------------------------------------------------------------------------------------------
 * Tooltip.Trigger
 * -----------------------------------------------------------------------------------------------*/

export const TooltipTrigger = forwardRef<HTMLButtonElement, TooltipTrigger.Props>((props, ref) => {
    const componentProps = resolveStyles(props);
    const { triggerRef } = useTooltipArrowContext() ?? {};
    const composedRef = composeRefs(triggerRef, ref);

    return <BaseTooltip.Trigger ref={composedRef} {...componentProps} />;
});
TooltipTrigger.displayName = 'Tooltip.Trigger';

/* -------------------------------------------------------------------------------------------------
 * Tooltip.PortalPrimitive
 * -----------------------------------------------------------------------------------------------*/

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

export const TooltipPositionerPrimitive = forwardRef<
    HTMLDivElement,
    TooltipPositionerPrimitive.Props
>((props, ref) => {
    const {
        side = 'top',
        align = 'center',
        sideOffset = 8,
        arrowPadding = DEFAULT_TOOLTIP_ARROW_PADDING,
        collisionAvoidance,
        ...componentProps
    } = resolveStyles(props);
    const { positionerRef, setArrowPadding } = useTooltipArrowContext() ?? {};
    const composedRef = composeRefs(positionerRef, ref);

    useIsoLayoutEffect(() => {
        setArrowPadding?.(arrowPadding);
    }, [arrowPadding, setArrowPadding]);

    return (
        <BaseTooltip.Positioner
            ref={composedRef}
            side={side}
            align={align}
            sideOffset={sideOffset}
            arrowPadding={arrowPadding}
            collisionAvoidance={{ align: 'none', ...collisionAvoidance }}
            {...componentProps}
        />
    );
});
TooltipPositionerPrimitive.displayName = 'Tooltip.PositionerPrimitive';

/* -------------------------------------------------------------------------------------------------
 * Tooltip.PopupPrimitive
 * -----------------------------------------------------------------------------------------------*/

const DATA_SIDE = 'data-side';
const DATA_ALIGN = 'data-align';

export const TooltipPopupPrimitive = forwardRef<HTMLDivElement, TooltipPopupPrimitive.Props>(
    (props, ref) => {
        const { className, children, ...componentProps } = resolveStyles(props);

        const [side, setSide] = useState<TooltipPositionerPrimitive.Props['side']>('top');
        const [align, setAlign] = useState<TooltipPositionerPrimitive.Props['align']>('center');

        const { triggerRef, positionerRef, arrowPadding } = useTooltipArrowContext() ?? {};
        const arrowDimensions = { width: 10, height: 6 };
        const position = useArrowPosition({
            triggerElement: triggerRef?.current ?? null,
            positionerElement: positionerRef?.current ?? null,
            side: side ?? 'top',
            align: align ?? 'center',
            offset: arrowPadding ?? DEFAULT_TOOLTIP_ARROW_PADDING,
            arrowDimensions,
        });
        const arrowStyle = {
            ...getArrowSideStyle(side ?? 'top', arrowDimensions),
            ...position,
        };

        const popupRef = useRef<HTMLDivElement>(null);
        const composedRef = composeRefs(popupRef, ref);

        useEffect(() => {
            if (!popupRef.current) return;

            const dataset = popupRef.current.dataset;
            const { side: initialSide, align: initialAlign } = extractPositions(dataset);

            if (initialSide) setSide(initialSide);
            if (initialAlign) setAlign(initialAlign);
        }, []);

        const arrowRef = useMutationObserverRef<HTMLDivElement>({
            callback: (mutations) => {
                mutations.forEach((mutation) => {
                    const { attributeName, target: mutationTarget } = mutation;

                    const dataset = (mutationTarget as HTMLElement).dataset;
                    const { side: nextSide, align: nextAlign } = extractPositions(dataset);

                    if (attributeName === DATA_SIDE && nextSide) setSide(nextSide);
                    if (attributeName === DATA_ALIGN && nextAlign) setAlign(nextAlign);
                });
            },
            options: { attributes: true, attributeFilter: [DATA_SIDE, DATA_ALIGN] },
        });

        return (
            <BaseTooltip.Popup
                ref={composedRef}
                className={cn(styles.popup, className)}
                {...componentProps}
            >
                <BaseTooltip.Arrow ref={arrowRef} style={arrowStyle} className={styles.arrow}>
                    <ArrowIcon />
                </BaseTooltip.Arrow>

                {children}
            </BaseTooltip.Popup>
        );
    },
);
TooltipPopupPrimitive.displayName = 'Tooltip.PopupPrimitive';

const extractPositions = (dataset: DOMStringMap) => {
    const currentSide = dataset.side as VaporUIComponentProps<
        typeof BaseTooltip.Positioner,
        BaseTooltip.Positioner.State
    >['side'];

    const currentAlign = dataset.align as VaporUIComponentProps<
        typeof BaseTooltip.Positioner,
        BaseTooltip.Positioner.State
    >['align'];

    return { side: currentSide, align: currentAlign };
};

/* -------------------------------------------------------------------------------------------------
 * Tooltip.Popup
 * -----------------------------------------------------------------------------------------------*/

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
            width="10"
            height="6"
            viewBox="0 0 10 6"
            fill="var(--color-background-contrast-200)"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <path
                d="M10 6L-7.86805e-07 6L4.06574 0.504109C4.56298 -0.168037 5.43702 -0.168037 5.93426 0.504109L10 6Z"
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
     * A custom element for Tooltip.PortalPrimitive. If not provided, the default Tooltip.PortalPrimitive will be rendered.
     */
    portalElement?: ReactElement<TooltipPortalPrimitive.Props>;
    /**
     * A custom element for Tooltip.PositionerPrimitive. If not provided, the default Tooltip.PositionerPrimitive will be rendered.
     */
    positionerElement?: ReactElement<TooltipPositionerPrimitive.Props>;
}

export namespace TooltipPopup {
    export type State = TooltipPopupPrimitive.State;
    export type Props = TooltipPopupProps;
}
