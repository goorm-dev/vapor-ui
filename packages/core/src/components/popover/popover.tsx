import type { CSSProperties, ComponentPropsWithoutRef } from 'react';
import { forwardRef, useEffect, useMemo, useRef, useState } from 'react';

import { Popover as BasePopover } from '@base-ui-components/react/popover';
import clsx from 'clsx';

import { useMutationObserver } from '~/hooks/use-mutation-observer';
import { vars } from '~/styles/vars.css';
import { composeRefs } from '~/utils/compose-refs';

import * as styles from './popover.css';

/* -------------------------------------------------------------------------------------------------
 * Popover.Root
 * -----------------------------------------------------------------------------------------------*/

type RootPrimitiveProps = ComponentPropsWithoutRef<typeof BasePopover.Root>;
interface PopoverRootProps extends RootPrimitiveProps {}

const Root = (props: PopoverRootProps) => {
    return <BasePopover.Root {...props} />;
};

/* -------------------------------------------------------------------------------------------------
 * Popover.Trigger
 * -----------------------------------------------------------------------------------------------*/

type TriggerPrimitiveProps = ComponentPropsWithoutRef<typeof BasePopover.Trigger>;
interface PopoverTriggerProps extends TriggerPrimitiveProps {}

const Trigger = forwardRef<HTMLButtonElement, PopoverTriggerProps>((props, ref) => {
    return <BasePopover.Trigger ref={ref} {...props} />;
});

/* -------------------------------------------------------------------------------------------------
 * Popover.Portal
 * -----------------------------------------------------------------------------------------------*/

type PortalPrimitiveProps = ComponentPropsWithoutRef<typeof BasePopover.Portal>;
interface PopoverPortalProps extends PortalPrimitiveProps {}

const Portal = (props: PopoverPortalProps) => {
    return <BasePopover.Portal {...props} />;
};

/* -------------------------------------------------------------------------------------------------
 * Popover.Positioner
 * -----------------------------------------------------------------------------------------------*/

type PositionerPrimitiveProps = ComponentPropsWithoutRef<typeof BasePopover.Positioner>;
interface PopoverPositionerProps extends PositionerPrimitiveProps {}

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

type PopupPrimitiveProps = ComponentPropsWithoutRef<typeof BasePopover.Popup>;
interface PopoverPopupProps extends PopupPrimitiveProps {}

const Popup = forwardRef<HTMLDivElement, PopoverPopupProps>(
    ({ className, children, ...props }, ref) => {
        const [side, setSide] = useState<PositionerPrimitiveProps['side']>('bottom');
        const [align, setAlign] = useState<PositionerPrimitiveProps['align']>('start');

        // arrow position을 메모이제이션
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

interface PopoverContentProps extends ComponentPropsWithoutRef<typeof Popup> {}

const Content = forwardRef<HTMLDivElement, PopoverContentProps>((props, ref) => {
    return (
        <Portal>
            <Positioner>
                <Popup ref={ref} {...props} />
            </Positioner>
        </Portal>
    );
});
Content.displayName = 'Popover.Content';

/* -------------------------------------------------------------------------------------------------
 * Popover.Title
 * -----------------------------------------------------------------------------------------------*/

type TitlePrimitiveProps = ComponentPropsWithoutRef<typeof BasePopover.Title>;
interface PopoverTitleProps extends TitlePrimitiveProps {}

const Title = forwardRef<HTMLHeadingElement, PopoverTitleProps>((props, ref) => {
    // NOTE: Consider whether to add styles for the Title component
    return <BasePopover.Title ref={ref} {...props} />;
});

/* -------------------------------------------------------------------------------------------------
 * Popover.Description
 * -----------------------------------------------------------------------------------------------*/

type DescriptionPrimitiveProps = ComponentPropsWithoutRef<typeof BasePopover.Description>;
interface PopoverDescriptionProps extends DescriptionPrimitiveProps {}

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

const ArrowIcon = (props: ComponentPropsWithoutRef<'svg'>) => {
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
    Portal,
    Positioner,
    Popup,
    Content,
    Title,
    Description,
};
