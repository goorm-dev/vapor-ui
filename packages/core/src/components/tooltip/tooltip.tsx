'use client';

import type { CSSProperties, ComponentProps, ReactElement } from 'react';
import { forwardRef, useEffect, useMemo, useRef, useState } from 'react';

import { useRender } from '@base-ui-components/react';
import { Tooltip as BaseTooltip } from '@base-ui-components/react/tooltip';
import clsx from 'clsx';

import { useMutationObserver } from '~/hooks/use-mutation-observer';
import { vars } from '~/styles/themes.css';
import { composeRefs } from '~/utils/compose-refs';
import { createRender } from '~/utils/create-renderer';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VComponentProps } from '~/utils/types';

import * as styles from './tooltip.css';

/* -----------------------------------------------------------------------------------------------*/

/* -------------------------------------------------------------------------------------------------
 * Tooltip.Root
 * -----------------------------------------------------------------------------------------------*/

export const TooltipRoot = (props: TooltipRoot.Props) => {
    return <BaseTooltip.Root {...props} />;
};

/* -------------------------------------------------------------------------------------------------
 * Tooltip.Trigger
 * -----------------------------------------------------------------------------------------------*/

export const TooltipTrigger = forwardRef<HTMLButtonElement, TooltipTrigger.Props>((props, ref) => {
    const componentProps = resolveStyles(props);

    return <BaseTooltip.Trigger ref={ref} {...componentProps} />;
});
TooltipTrigger.displayName = 'Tooltip.Trigger';

/* -------------------------------------------------------------------------------------------------
 * Tooltip.PortalPrimitive
 * -----------------------------------------------------------------------------------------------*/

export const TooltipPortalPrimitive = (props: TooltipPortalPrimitive.Props) => {
    return <BaseTooltip.Portal {...props} />;
};
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
        className,
        ...componentProps
    } = resolveStyles(props);

    return (
        <BaseTooltip.Positioner
            ref={ref}
            side={side}
            align={align}
            sideOffset={sideOffset}
            collisionAvoidance={{ align: 'none', ...collisionAvoidance }}
            className={clsx(styles.positioner, className)}
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

        const position = useMemo(
            () =>
                getArrowPosition({
                    side,
                    align,
                    offset: side === 'top' || side === 'bottom' ? 12 : 6,
                }),
            [side, align],
        );

        const popupRef = useRef<HTMLDivElement>(null);
        const composedRef = composeRefs(popupRef, ref);

        useEffect(() => {
            if (!popupRef.current) return;

            const dataset = popupRef.current.dataset;
            const { side: initialSide, align: initialAlign } = extractPositions(dataset);

            if (initialSide) setSide(initialSide);
            if (initialAlign) setAlign(initialAlign);
        }, []);

        const arrowRef = useMutationObserver<HTMLDivElement>({
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
                className={clsx(styles.popup, className)}
                {...componentProps}
            >
                <BaseTooltip.Arrow ref={arrowRef} style={position} className={styles.arrow}>
                    <ArrowIcon />
                </BaseTooltip.Arrow>

                {children}
            </BaseTooltip.Popup>
        );
    },
);
TooltipPopupPrimitive.displayName = 'Tooltip.PopupPrimitive';

const extractPositions = (dataset: DOMStringMap) => {
    const currentSide = dataset.side as VComponentProps<typeof BaseTooltip.Positioner>['side'];
    const currentAlign = dataset.align as VComponentProps<typeof BaseTooltip.Positioner>['align'];
    return { side: currentSide, align: currentAlign };
};

/* -------------------------------------------------------------------------------------------------
 * Tooltip.Popup
 * -----------------------------------------------------------------------------------------------*/

export const TooltipPopup = forwardRef<HTMLDivElement, TooltipPopup.Props>(
    ({ portalElement, positionerElement, ...props }, ref) => {
        const popup = <TooltipPopupPrimitive ref={ref} {...props} />;

        const positioner = useRender({
            render: createRender(positionerElement, <TooltipPositionerPrimitive />),
            props: { children: popup },
        });

        const portal = useRender({
            render: createRender(portalElement, <TooltipPortalPrimitive />),
            props: { children: positioner },
        });

        return portal;
    },
);
TooltipPopup.displayName = 'Tooltip.Popup';

/* -----------------------------------------------------------------------------------------------*/

type ArrowPositionProps = Pick<VComponentProps<typeof BaseTooltip.Positioner>, 'side' | 'align'> & {
    offset?: number;
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
    export interface Props extends VComponentProps<typeof BaseTooltip.Root> {}
    export type ChangeEventDetails = BaseTooltip.Root.ChangeEventDetails;
}

export namespace TooltipTrigger {
    export interface Props extends VComponentProps<typeof BaseTooltip.Trigger> {}
}

export namespace TooltipPortalPrimitive {
    export interface Props extends VComponentProps<typeof BaseTooltip.Portal> {}
}

export namespace TooltipPositionerPrimitive {
    export interface Props extends VComponentProps<typeof BaseTooltip.Positioner> {}
}

export namespace TooltipPopupPrimitive {
    export interface Props extends VComponentProps<typeof BaseTooltip.Popup> {}
}

export namespace TooltipPopup {
    export interface Props extends VComponentProps<typeof TooltipPopupPrimitive> {
        portalElement?: ReactElement<TooltipPortalPrimitive.Props>;
        positionerElement?: ReactElement<TooltipPositionerPrimitive.Props>;
    }
}
