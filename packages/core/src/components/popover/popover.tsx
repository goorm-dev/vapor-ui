import { type ComponentPropsWithoutRef, forwardRef } from 'react';

import { Popover as BasePopover } from '@base-ui-components/react/popover';
import clsx from 'clsx';

import { Arrow } from '~/components/arrow';
import { createContext } from '~/libs/create-context';
import { createSplitProps } from '~/utils/create-split-props';
import type { OnlyPositionerProps } from '~/utils/positioner-props';

import * as styles from './popover.css';

type PositionerProps = OnlyPositionerProps<typeof BasePopover.Positioner>;

type PopoverSharedProps = PositionerProps;
type PopoverContext = PopoverSharedProps;

const [PopoverProvider, usePopoverContext] = createContext<PopoverContext>({
    name: 'Popover',
    hookName: 'usePopoverContext',
    providerName: 'PopoverProvider',
});

/* -------------------------------------------------------------------------------------------------
 * Popover.Root
 * -----------------------------------------------------------------------------------------------*/

type RootPrimitiveProps = ComponentPropsWithoutRef<typeof BasePopover.Root>;
interface PopoverRootProps extends RootPrimitiveProps, PopoverSharedProps {}

const Root = (props: PopoverRootProps) => {
    const [sharedProps, otherProps] = createSplitProps<PositionerProps>()(props, [
        'align',
        'alignOffset',
        'side',
        'sideOffset',
        'anchor',
        'arrowPadding',
        'collisionAvoidance',
        'collisionBoundary',
        'collisionPadding',
        'positionMethod',
        'sticky',
        'trackAnchor',
    ]);

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
        const { sideOffset = 8, ...context } = usePopoverContext();

        return (
            <BasePopover.Positioner
                sideOffset={sideOffset}
                collisionAvoidance={{ align: 'none' }}
                {...context}
            >
                <BasePopover.Popup ref={ref} className={clsx(styles.content, className)} {...props}>
                    <Arrow
                        render={<BasePopover.Arrow />}
                        side={context.side}
                        align={context.align}
                        offset={12}
                        className={styles.arrow}
                    />

                    {children}
                </BasePopover.Popup>
            </BasePopover.Positioner>
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

// const ArrowIcon = (props: ComponentPropsWithoutRef<'svg'>) => {
//     return (
//         <svg
//             xmlns="http://www.w3.org/2000/svg"
//             width="8"
//             height="16"
//             viewBox="0 0 8 16"
//             fill="none"
//             {...props}
//         >
//             <path
//                 d="M1.17969 8.93457C0.620294 8.43733 0.620294 7.56267 1.17969 7.06543L7.25 1.66992L7.25 14.3301L1.17969 8.93457Z"
//                 stroke={vars.color.border.normal}
//                 strokeWidth="1"
//             />
//             <path
//                 d="M1.8858 7.24074C1.42019 7.63984 1.42019 8.36016 1.8858 8.75926L8 14L8 2L1.8858 7.24074Z"
//                 fill="white"
//             />
//         </svg>
//     );
// };

/* -----------------------------------------------------------------------------------------------*/

export {
    Root as PopoverRoot,
    Trigger as PopoverTrigger,
    Portal as PopoverPortal,
    Content as PopoverContent,
    Title as PopoverTitle,
    Description as PopoverDescription,
};

export type {
    PopoverRootProps,
    PopoverTriggerProps,
    PopoverPortalProps,
    PopoverContentProps,
    PopoverTitleProps,
    PopoverDescriptionProps,
};

export const Popover = {
    Root,
    Trigger,
    Portal,
    Content,
    Title,
    Description,
};
