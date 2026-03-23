'use client';

import type { CSSProperties, ComponentProps, ReactElement } from 'react';
import { forwardRef, useEffect, useMemo, useRef, useState } from 'react';

import { Popover as BasePopover } from '@base-ui/react/popover';

import { useMutationObserverRef } from '~/hooks/use-mutation-observer-ref';
import { useRenderElement } from '~/hooks/use-render-element';
import { vars } from '~/styles/themes.css';
import { cn } from '~/utils/cn';
import { composeRefs } from '~/utils/compose-refs';
import { createRender } from '~/utils/create-renderer';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VaporUIComponentProps } from '~/utils/types';

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

export const PopoverPortalPrimitive = forwardRef<HTMLDivElement, PopoverPortalPrimitive.Props>(
    (props, ref) => {
        const componentProps = resolveStyles(props);

        return <BasePopover.Portal ref={ref} {...componentProps} />;
    },
);
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
            <BasePopover.Popup
                ref={composedRef}
                className={cn(styles.popup, className)}
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

        const positionerRender = createRender(positionerElement, <PopoverPositionerPrimitive />);
        const positioner = useRenderElement({
            render: positionerRender,
            props: { children: popup },
        });

        const portalRender = createRender(portalElement, <PopoverPortalPrimitive />);
        const portal = useRenderElement({
            render: portalRender,
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
    export type State = BasePopover.Root.State;
    export type Props = BasePopover.Root.Props;

    export type Actions = BasePopover.Root.Actions;
    export type ChangeEventDetails = BasePopover.Root.ChangeEventDetails;
}

export namespace PopoverTrigger {
    export type State = BasePopover.Trigger.State;
    export type Props = VaporUIComponentProps<typeof BasePopover.Trigger, State>;
}

export namespace PopoverClose {
    export type State = BasePopover.Close.State;
    export type Props = VaporUIComponentProps<typeof BasePopover.Close, State>;
}

export namespace PopoverPortalPrimitive {
    export type State = BasePopover.Portal.State;
    export type Props = VaporUIComponentProps<typeof BasePopover.Portal, State>;
}

export namespace PopoverPositionerPrimitive {
    export type State = BasePopover.Positioner.State;
    export type Props = VaporUIComponentProps<typeof BasePopover.Positioner, State>;
}

export namespace PopoverPopupPrimitive {
    export type State = BasePopover.Popup.State;
    export type Props = VaporUIComponentProps<typeof BasePopover.Popup, State>;
}

export interface PopoverPopupProps extends PopoverPopupPrimitive.Props {
    /**
     * A Custom element for Popover.PortalPrimitive. If not provided, the default Popover.PortalPrimitive will be rendered.
     */
    portalElement?: ReactElement<PopoverPortalPrimitive.Props>;
    /**
     * A Custom element for Popover.PositionerPrimitive. If not provided, the default Popover.PositionerPrimitive will be rendered.
     */
    positionerElement?: ReactElement<PopoverPositionerPrimitive.Props>;
}

export namespace PopoverPopup {
    export type State = PopoverPopupPrimitive.State;
    export type Props = PopoverPopupProps;
}

export namespace PopoverTitle {
    export type State = BasePopover.Title.State;
    export type Props = VaporUIComponentProps<typeof BasePopover.Title, State>;
}

export namespace PopoverDescription {
    export type State = BasePopover.Description.State;
    export type Props = VaporUIComponentProps<typeof BasePopover.Description, State>;
}
