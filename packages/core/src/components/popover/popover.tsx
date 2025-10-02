'use client';

import type { CSSProperties } from 'react';
import { forwardRef, useEffect, useMemo, useRef, useState } from 'react';

import { Popover as BasePopover } from '@base-ui-components/react/popover';
import clsx from 'clsx';

import { useMutationObserver } from '~/hooks/use-mutation-observer';
import { vars } from '~/styles/vars.css';
import { composeRefs } from '~/utils/compose-refs';
import type { VComponentProps } from '~/utils/types';

import * as styles from './popover.css';

/* -------------------------------------------------------------------------------------------------
 * Popover.Root
 * -----------------------------------------------------------------------------------------------*/

type RootPrimitiveProps = VComponentProps<typeof BasePopover.Root>;
interface PopoverRootProps extends RootPrimitiveProps {}

/**
 * Provides the root context for a popover overlay. Renders a <div> element.
 */
const Root = (props: PopoverRootProps) => {
    return <BasePopover.Root {...props} />;
};

/* -------------------------------------------------------------------------------------------------
 * Popover.Trigger
 * -----------------------------------------------------------------------------------------------*/

type TriggerPrimitiveProps = VComponentProps<typeof BasePopover.Trigger>;
interface PopoverTriggerProps extends TriggerPrimitiveProps {}

/**
 * Renders a button that triggers the popover. Renders a <button> element.
 */
const Trigger = forwardRef<HTMLButtonElement, PopoverTriggerProps>((props, ref) => {
    return <BasePopover.Trigger ref={ref} {...props} />;
});

/* -------------------------------------------------------------------------------------------------
 * Popover.Close
 * -----------------------------------------------------------------------------------------------*/

interface PopoverCloseProps extends VComponentProps<typeof BasePopover.Close> {}

/**
 * Renders a button that closes the popover. Renders a <button> element.
 */
const Close = forwardRef<HTMLButtonElement, PopoverCloseProps>((props, ref) => {
    return <BasePopover.Close ref={ref} {...props} />;
});
Close.displayName = 'Popover.Close';

/* -------------------------------------------------------------------------------------------------
 * Popover.Portal
 * -----------------------------------------------------------------------------------------------*/

type PortalPrimitiveProps = VComponentProps<typeof BasePopover.Portal>;
interface PopoverPortalProps extends PortalPrimitiveProps {}

/**
 * Renders popover content in a portal outside the normal DOM tree.
 */
const Portal = (props: PopoverPortalProps) => {
    return <BasePopover.Portal {...props} />;
};

/* -------------------------------------------------------------------------------------------------
 * Popover.Positioner
 * -----------------------------------------------------------------------------------------------*/

type PositionerPrimitiveProps = VComponentProps<typeof BasePopover.Positioner>;
interface PopoverPositionerProps extends PositionerPrimitiveProps {}

/**
 * Positions the popover content relative to the trigger. Renders a <div> element.
 */
const Positioner = forwardRef<HTMLDivElement, PopoverPositionerProps>(
    ({ side = 'bottom', align = 'center', sideOffset = 8, collisionAvoidance, ...props }, ref) => {
        return (
            <BasePopover.Positioner
                ref={ref}
                side={side}
                align={align}
                sideOffset={sideOffset}
                collisionAvoidance={{ align: 'none', ...collisionAvoidance }}
                {...props}
            />
        );
    },
);

/* -------------------------------------------------------------------------------------------------
 * Popover.Popup
 * -----------------------------------------------------------------------------------------------*/

const DATA_SIDE = 'data-side';
const DATA_ALIGN = 'data-align';

type PopupPrimitiveProps = VComponentProps<typeof BasePopover.Popup>;
interface PopoverPopupProps extends PopupPrimitiveProps {}

/**
 * Renders the popover content container with an arrow. Renders a <div> element.
 */
const Popup = forwardRef<HTMLDivElement, PopoverPopupProps>(
    ({ className, children, ...props }, ref) => {
        const [side, setSide] = useState<PositionerPrimitiveProps['side']>('bottom');
        const [align, setAlign] = useState<PositionerPrimitiveProps['align']>('start');

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
                {...props}
            >
                <BasePopover.Arrow ref={arrowRef} style={position} className={styles.arrow}>
                    <ArrowIcon />
                </BasePopover.Arrow>

                {children}
            </BasePopover.Popup>
        );
    },
);

const extractPositions = (dataset: DOMStringMap) => {
    const currentSide = dataset.side as PositionerPrimitiveProps['side'];
    const currentAlign = dataset.align as PositionerPrimitiveProps['align'];
    return { side: currentSide, align: currentAlign };
};

/* -------------------------------------------------------------------------------------------------
 * Popover.Content
 * -----------------------------------------------------------------------------------------------*/

interface PopoverContentProps extends VComponentProps<typeof Popup> {
    portalProps?: PopoverPortalProps;
    positionerProps?: PopoverPositionerProps;
}

/**
 * Combines Portal, Positioner, and Popup components for easy popover content rendering. Renders a <div> element.
 */
const Content = forwardRef<HTMLDivElement, PopoverContentProps>(
    ({ portalProps, positionerProps, ...props }, ref) => {
        return (
            <Portal {...portalProps}>
                <Positioner {...positionerProps}>
                    <Popup ref={ref} {...props} />
                </Positioner>
            </Portal>
        );
    },
);
Content.displayName = 'Popover.Content';

/* -------------------------------------------------------------------------------------------------
 * Popover.Title
 * -----------------------------------------------------------------------------------------------*/

type TitlePrimitiveProps = VComponentProps<typeof BasePopover.Title>;
interface PopoverTitleProps extends TitlePrimitiveProps {}

/**
 * Renders the popover title for accessibility. Renders an <h2> element.
 */
const Title = forwardRef<HTMLHeadingElement, PopoverTitleProps>((props, ref) => {
    // NOTE: Consider whether to add styles for the Title component
    return <BasePopover.Title ref={ref} {...props} />;
});

/* -------------------------------------------------------------------------------------------------
 * Popover.Description
 * -----------------------------------------------------------------------------------------------*/

type DescriptionPrimitiveProps = VComponentProps<typeof BasePopover.Description>;
interface PopoverDescriptionProps extends DescriptionPrimitiveProps {}

/**
 * Renders the popover description for accessibility. Renders a <p> element.
 */
const Description = forwardRef<HTMLParagraphElement, PopoverDescriptionProps>((props, ref) => {
    // NOTE: Consider whether to add styles for the Description component
    return <BasePopover.Description ref={ref} {...props} />;
});

/* -----------------------------------------------------------------------------------------------*/

type ArrowPositionProps = Pick<PositionerPrimitiveProps, 'side' | 'align'> & { offset?: number };

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

const ArrowIcon = (props: VComponentProps<'svg'>) => {
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

export {
    Root as PopoverRoot,
    Trigger as PopoverTrigger,
    Close as PopoverClose,
    Portal as PopoverPortal,
    Positioner as PopoverPositioner,
    Popup as PopoverPopup,
    Content as PopoverContent,
    Title as PopoverTitle,
    Description as PopoverDescription,
};

export type {
    PopoverRootProps,
    PopoverTriggerProps,
    PopoverCloseProps,
    PopoverPortalProps,
    PopoverPositionerProps,
    PopoverPopupProps,
    PopoverContentProps,
    PopoverTitleProps,
    PopoverDescriptionProps,
};

export const Popover = {
    Root,
    Trigger,
    Close,
    Portal,
    Positioner,
    Popup,
    Content,
    Title,
    Description,
};
