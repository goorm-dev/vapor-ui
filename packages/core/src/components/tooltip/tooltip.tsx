import type { CSSProperties, ComponentPropsWithoutRef } from 'react';
import { forwardRef, useState } from 'react';

import { Tooltip as BaseTooltip } from '@base-ui-components/react/tooltip';
import clsx from 'clsx';

import { useMutationObserver } from '~/hooks/use-mutation-observer';
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

const dataSide = 'data-side';
const dataAlign = 'data-align';

type ContentPrimitiveProps = ComponentPropsWithoutRef<typeof BaseTooltip.Popup>;
interface TooltipContentProps extends ContentPrimitiveProps {}

const Content = forwardRef<HTMLDivElement, TooltipContentProps>(
    ({ className, children, ...props }, ref) => {
        const { side: rootSide, align: rootAlign } = useTooltipContext();

        const [side, setSide] = useState(rootSide);
        const [align, setAlign] = useState(rootAlign);

        const position = getArrowPosition({ side, align, offset: 6 });

        const arrowRef = useMutationObserver<HTMLDivElement>({
            callback: (mutations) => {
                mutations.forEach((mutation) => {
                    const { attributeName, target: mutationTarget } = mutation;

                    const dataset = (mutationTarget as HTMLElement).dataset;
                    const nextSide = dataset.side as PositionerProps['side'];
                    const nextAlign = dataset.align as PositionerProps['align'];

                    if (attributeName === dataSide && nextSide) setSide(nextSide);
                    if (attributeName === dataAlign && nextAlign) setAlign(nextAlign);
                });
            },
            options: { attributes: true, attributeFilter: [dataSide, dataAlign] },
        });

        return (
            <BaseTooltip.Popup ref={ref} className={clsx(styles.content, className)} {...props}>
                <BaseTooltip.Arrow ref={arrowRef} style={position} className={styles.arrow}>
                    <ArrowIcon />
                </BaseTooltip.Arrow>

                {children}
            </BaseTooltip.Popup>
        );
    },
);

/* -----------------------------------------------------------------------------------------------*/

type ArrowPositionProps = Pick<PositionerProps, 'side' | 'align'> & { offset?: number };

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
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="8"
            height="17"
            viewBox="0 0 8 17"
            fill="none"
            {...props}
        >
            <path
                d="M-6.99382e-07 16.5L1.43051e-06 0.5L7.32785 7.00518C8.22405 7.80076 8.22405 9.19924 7.32785 9.99482L-6.99382e-07 16.5Z"
                fill="currentColor"
            />
        </svg>
    );
};

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
