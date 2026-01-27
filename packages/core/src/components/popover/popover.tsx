'use client';

import type { CSSProperties, ComponentProps, ReactElement } from 'react';
import { forwardRef, useEffect, useMemo, useRef, useState } from 'react';

import { Popover as BasePopover } from '@base-ui/react/popover';
import { useRender } from '@base-ui/react/use-render';
import clsx from 'clsx';

import { useMutationObserver } from '~/hooks/use-mutation-observer';
import { vars } from '~/styles/themes.css';
import { composeRefs } from '~/utils/compose-refs';
import { createRender } from '~/utils/create-renderer';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VComponentProps } from '~/utils/types';

import * as styles from './popover.css';

/* -------------------------------------------------------------------------------------------------
 * Popover.Root
 * -----------------------------------------------------------------------------------------------*/

export const PopoverRoot = (props: PopoverRoot.Props) => {
    return <BasePopover.Root {...props} />;
};
PopoverRoot.displayName = 'Popover.Root';

/* -------------------------------------------------------------------------------------------------
 * Popover.Trigger
 * -----------------------------------------------------------------------------------------------*/

export const PopoverTrigger = forwardRef<HTMLButtonElement, PopoverTrigger.Props>((props, ref) => {
    const componentProps = resolveStyles(props);

    return <BasePopover.Trigger ref={ref} {...componentProps} />;
});
PopoverTrigger.displayName = 'Popover.Trigger';

/* -------------------------------------------------------------------------------------------------
 * Popover.Close
 * -----------------------------------------------------------------------------------------------*/

export const PopoverClose = forwardRef<HTMLButtonElement, PopoverClose.Props>((props, ref) => {
    const componentProps = resolveStyles(props);

    return <BasePopover.Close ref={ref} {...componentProps} />;
});
PopoverClose.displayName = 'Popover.Close';

/* -------------------------------------------------------------------------------------------------
 * Popover.PortalPrimitive
 * -----------------------------------------------------------------------------------------------*/

export const PopoverPortalPrimitive = (props: PopoverPortalPrimitive.Props) => {
    return <BasePopover.Portal {...props} />;
};
PopoverPortalPrimitive.displayName = 'Popover.PortalPrimitive';

/* -------------------------------------------------------------------------------------------------
 * Popover.PositionerPrimitive
 * -----------------------------------------------------------------------------------------------*/

export const PopoverPositionerPrimitive = forwardRef<
    HTMLDivElement,
    PopoverPositionerPrimitive.Props
>((props, ref) => {
    const {
        side = 'bottom',
        align = 'center',
        sideOffset = 8,
        collisionAvoidance,
        ...componentProps
    } = resolveStyles(props);

    return (
        <BasePopover.Positioner
            ref={ref}
            side={side}
            align={align}
            sideOffset={sideOffset}
            collisionAvoidance={{ align: 'none', ...collisionAvoidance }}
            {...componentProps}
        />
    );
});
PopoverPositionerPrimitive.displayName = 'Popover.PositionerPrimitive';

/* -------------------------------------------------------------------------------------------------
 * Popover.PopupPrimitive
 * -----------------------------------------------------------------------------------------------*/

const DATA_SIDE = 'data-side';
const DATA_ALIGN = 'data-align';

export const PopoverPopupPrimitive = forwardRef<HTMLDivElement, PopoverPopupPrimitive.Props>(
    (props, ref) => {
        const { className, children, ...componentProps } = resolveStyles(props);

        const [side, setSide] = useState<PopoverPositionerPrimitive.Props['side']>('bottom');
        const [align, setAlign] = useState<PopoverPositionerPrimitive.Props['align']>('start');

        const position = useMemo(() => getArrowPosition({ side, align }), [side, align]);

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
            <BasePopover.Popup
                ref={composedRef}
                className={clsx(styles.popup, className)}
                {...componentProps}
            >
                <BasePopover.Arrow ref={arrowRef} style={position} className={styles.arrow}>
                    <ArrowIcon />
                </BasePopover.Arrow>

                {children}
            </BasePopover.Popup>
        );
    },
);
PopoverPopupPrimitive.displayName = 'Popover.PopupPrimitive';

const extractPositions = (dataset: DOMStringMap) => {
    const currentSide = dataset.side as PopoverPositionerPrimitive.Props['side'];
    const currentAlign = dataset.align as PopoverPositionerPrimitive.Props['align'];
    return { side: currentSide, align: currentAlign };
};

/* -------------------------------------------------------------------------------------------------
 * Popover.Popup
 * -----------------------------------------------------------------------------------------------*/

export const PopoverPopup = forwardRef<HTMLDivElement, PopoverPopup.Props>(
    ({ portalElement, positionerElement, ...props }, ref) => {
        const popup = <PopoverPopupPrimitive ref={ref} {...props} />;

        const positioner = useRender({
            render: createRender(positionerElement, <PopoverPositionerPrimitive />),
            props: { children: popup },
        });

        const portal = useRender({
            render: createRender(portalElement ?? <PopoverPortalPrimitive />),
            props: { children: positioner },
        });

        return portal;
    },
);
PopoverPopup.displayName = 'Popover.Popup';

/* -------------------------------------------------------------------------------------------------
 * Popover.Title
 * -----------------------------------------------------------------------------------------------*/

export const PopoverTitle = forwardRef<HTMLHeadingElement, PopoverTitle.Props>((props, ref) => {
    const componentProps = resolveStyles(props);

    // NOTE: Consider whether to add styles for the Title component
    return <BasePopover.Title ref={ref} {...componentProps} />;
});
PopoverTitle.displayName = 'Popover.Title';

/* -------------------------------------------------------------------------------------------------
 * Popover.Description
 * -----------------------------------------------------------------------------------------------*/

export const PopoverDescription = forwardRef<HTMLParagraphElement, PopoverDescription.Props>(
    (props, ref) => {
        const componentProps = resolveStyles(props);

        // NOTE: Consider whether to add styles for the Description component
        return <BasePopover.Description ref={ref} {...componentProps} />;
    },
);
PopoverDescription.displayName = 'Popover.Description';

/* -----------------------------------------------------------------------------------------------*/

type ArrowPositionProps = Pick<PopoverPositionerPrimitive.Props, 'side' | 'align'> & {
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
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 16" fill="none" {...props}>
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

export namespace PopoverRoot {
    type RootPrimitiveProps = VComponentProps<typeof BasePopover.Root>;
    export interface Props extends RootPrimitiveProps {}
    export type ChangeEventDetails = BasePopover.Root.ChangeEventDetails;
}

export namespace PopoverTrigger {
    export type TriggerPrimitiveProps = VComponentProps<typeof BasePopover.Trigger>;
    export interface Props extends TriggerPrimitiveProps {}
}

export namespace PopoverClose {
    type ClosePrimitiveProps = VComponentProps<typeof BasePopover.Close>;
    export type Props = ClosePrimitiveProps;
}

export namespace PopoverPortalPrimitive {
    export type PrimitivePortalProps = VComponentProps<typeof BasePopover.Portal>;
    export interface Props extends PrimitivePortalProps {}
}

export namespace PopoverPositionerPrimitive {
    export type PrimitivePositionerProps = VComponentProps<typeof BasePopover.Positioner>;
    export interface Props extends PrimitivePositionerProps {}
}

export namespace PopoverPopupPrimitive {
    export type PrimitivePopupProps = VComponentProps<typeof BasePopover.Popup>;
    export interface Props extends PrimitivePopupProps {}
}

export namespace PopoverPopup {
    export type PrimitivePopupProps = VComponentProps<typeof PopoverPopupPrimitive>;
    export interface Props extends PrimitivePopupProps {
        portalElement?: ReactElement<PopoverPortalPrimitive.Props>;
        positionerElement?: ReactElement<PopoverPositionerPrimitive.Props>;
    }
}

export namespace PopoverTitle {
    export type PrimitiveTitleProps = VComponentProps<typeof BasePopover.Title>;
    export interface Props extends PrimitiveTitleProps {}
}

export namespace PopoverDescription {
    export type PrimitiveDescriptionProps = VComponentProps<typeof BasePopover.Description>;
    export interface Props extends PrimitiveDescriptionProps {}
}
