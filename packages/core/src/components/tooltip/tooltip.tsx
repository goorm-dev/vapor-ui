'use client';

import type { ComponentProps, ReactElement, RefObject } from 'react';
import { forwardRef, useEffect, useRef, useState } from 'react';

import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';

import { getArrowSideStyle, useArrowPosition } from '~/hooks/use-arrow-position';
import { useMutationObserverRef } from '~/hooks/use-mutation-observer-ref';
import { useRenderElement } from '~/hooks/use-render-element';
import { createContext } from '~/libs/create-context';
import { vars } from '~/styles/themes.css';
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
}

const [TooltipArrowProvider, useTooltipArrowContext] = createContext<TooltipArrowContextValue>({
    name: 'TooltipArrowContext',
    strict: false,
    hookName: 'useTooltipArrowContext',
    providerName: 'TooltipRoot',
});

/* -------------------------------------------------------------------------------------------------
 * Tooltip.Root
 * -----------------------------------------------------------------------------------------------*/

export const TooltipRoot = (props: TooltipRoot.Props) => {
    const triggerRef = useRef<Element>(null);
    const positionerRef = useRef<HTMLElement>(null);

    return (
        <TooltipArrowProvider value={{ triggerRef, positionerRef }}>
            <BaseTooltip.Root {...props} />
        </TooltipArrowProvider>
    );
};

/* -------------------------------------------------------------------------------------------------
 * Tooltip.Trigger
 * -----------------------------------------------------------------------------------------------*/

export const TooltipTrigger = forwardRef<HTMLButtonElement, TooltipTrigger.Props>((props, ref) => {
    const componentProps = resolveStyles(props);
    const ctx = useTooltipArrowContext();
    const composedRef = ctx ? composeRefs(ctx.triggerRef, ref) : ref;

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
        collisionAvoidance,
        ...componentProps
    } = resolveStyles(props);
    const ctx = useTooltipArrowContext();
    const composedRef = ctx ? composeRefs(ctx.positionerRef, ref) : ref;

    return (
        <BaseTooltip.Positioner
            ref={composedRef}
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

const DATA_SIDE = 'data-side';
const DATA_ALIGN = 'data-align';

export const TooltipPopupPrimitive = forwardRef<HTMLDivElement, TooltipPopupPrimitive.Props>(
    (props, ref) => {
        const { className, children, ...componentProps } = resolveStyles(props);

        const [side, setSide] = useState<TooltipPositionerPrimitive.Props['side']>('bottom');
        const [align, setAlign] = useState<TooltipPositionerPrimitive.Props['align']>('center');

        const ctx = useTooltipArrowContext();
        const position = useArrowPosition({
            triggerElement: ctx?.triggerRef.current ?? null,
            positionerElement: ctx?.positionerRef.current ?? null,
            side: side ?? 'top',
            align: align ?? 'center',
            offset: side === 'top' || side === 'bottom' ? 12 : 6,
        });
        const arrowStyle = { ...getArrowSideStyle(side ?? 'top'), ...position };

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
