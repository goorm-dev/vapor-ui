import type { CSSProperties } from 'react';
import { type ComponentPropsWithoutRef, forwardRef } from 'react';

import { Popover as BasePopover } from '@base-ui-components/react/popover';
import clsx from 'clsx';

import { createContext } from '~/libs/create-context';
import { type PositionerProps, splitPositionerProps } from '~/utils/split-positioner-props';

import * as styles from './popover.css';

type SharedProps = PositionerProps;
type ContextProps = SharedProps;

const [PopoverProvider, usePopoverContext] = createContext<ContextProps>({
    name: 'Popover',
    hookName: 'usePopoverContext',
    providerName: 'PopoverProvider',
});

/* -------------------------------------------------------------------------------------------------
 * Popover.Root
 * -----------------------------------------------------------------------------------------------*/

type RootPrimitiveProps = ComponentPropsWithoutRef<typeof BasePopover.Root>;
interface PopoverRootProps extends RootPrimitiveProps, SharedProps {}

const Root = (props: PopoverRootProps) => {
    const [sharedProps, otherProps] = splitPositionerProps<SharedProps>(props);

    return (
        <PopoverProvider value={sharedProps}>
            <BasePopover.Root {...otherProps} />
        </PopoverProvider>
    );
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
 * Popover.Positioner
 * -----------------------------------------------------------------------------------------------*/

type PositionerPrimitiveProps = ComponentPropsWithoutRef<typeof BasePopover.Positioner>;
interface PopoverPositionerProps extends Omit<PositionerPrimitiveProps, keyof SharedProps> {}

const Positioner = forwardRef<HTMLDivElement, PopoverPositionerProps>((props, ref) => {
    const { sideOffset = 8, ...context } = usePopoverContext();

    return <BasePopover.Positioner ref={ref} sideOffset={sideOffset} {...context} {...props} />;
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
 * Popover.Content
 * -----------------------------------------------------------------------------------------------*/

type ContentPrimitiveProps = ComponentPropsWithoutRef<typeof BasePopover.Popup>;
interface PopoverContentProps extends ContentPrimitiveProps {}

const Content = forwardRef<HTMLDivElement, PopoverContentProps>(
    ({ className, children, ...props }, ref) => {
        const { side, align } = usePopoverContext();
        const position = getArrowPosition({ side, align });

        return (
            <BasePopover.Popup ref={ref} className={clsx(styles.content, className)} {...props}>
                <BasePopover.Arrow style={position} className={styles.arrow}>
                    <ArrowIcon />
                </BasePopover.Arrow>

                {children}
            </BasePopover.Popup>
        );
    },
);

/* -------------------------------------------------------------------------------------------------
 * Popover.Title
 * -----------------------------------------------------------------------------------------------*/

type TitlePrimitiveProps = ComponentPropsWithoutRef<typeof BasePopover.Title>;
interface PopoverTitleProps extends TitlePrimitiveProps {}

const Title = forwardRef<HTMLHeadingElement, PopoverTitleProps>(({ className, ...props }, ref) => {
    return <BasePopover.Title ref={ref} className={clsx(styles.title, className)} {...props} />;
});

/* -------------------------------------------------------------------------------------------------
 * Popover.Description
 * -----------------------------------------------------------------------------------------------*/

type DescriptionPrimitiveProps = ComponentPropsWithoutRef<typeof BasePopover.Description>;
interface PopoverDescriptionProps extends DescriptionPrimitiveProps {}

const Description = forwardRef<HTMLParagraphElement, PopoverDescriptionProps>(
    ({ className, ...props }, ref) => {
        return (
            <BasePopover.Description
                ref={ref}
                className={clsx(styles.description, className)}
                {...props}
            />
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
        'left-start': { top: 'unset', bottom: offset },
        'left-end': { top: offset, bottom: 'unset' },
        'right-start': { top: 'unset', bottom: offset },
        'right-end': { top: offset, bottom: 'unset' },
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
    Root as PopoverRoot,
    Trigger as PopoverTrigger,
    Portal as PopoverPortal,
    Positioner as PopoverPositioner,
    Content as PopoverContent,
    Title as PopoverTitle,
    Description as PopoverDescription,
};

export type {
    PopoverRootProps,
    PopoverTriggerProps,
    PopoverPortalProps,
    PopoverPositionerProps,
    PopoverContentProps,
    PopoverTitleProps,
    PopoverDescriptionProps,
};

export const Popover = {
    Root,
    Trigger,
    Portal,
    Positioner,
    Content,
    Title,
    Description,
};
