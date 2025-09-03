'use client';

import type { CSSProperties, ComponentPropsWithoutRef } from 'react';
import { forwardRef, useEffect, useMemo, useRef, useState } from 'react';

import { NavigationMenu as BaseNavigationMenu } from '@base-ui-components/react';
import { ChevronDownOutlineIcon } from '@vapor-ui/icons';
import clsx from 'clsx';

import { useMutationObserver } from '~/hooks/use-mutation-observer';
import { createContext } from '~/libs/create-context';
import { createSlot } from '~/libs/create-slot';
import { vars } from '~/styles/vars.css';
import { composeRefs } from '~/utils/compose-refs';
import { createSplitProps } from '~/utils/create-split-props';
import type { VComponentProps } from '~/utils/types';

import type { ItemVariants, LinkVariants, ListVariants } from './navigation-menu.css';
import * as styles from './navigation-menu.css';

type NavigationMenuContextType = NavigationMenuVariants;
const [NavigationMenuProvider, useNavigationMenuContext] = createContext<NavigationMenuContextType>(
    {
        name: 'NavigationMenuContext',
        providerName: 'NavigationMenuProvider',
        hookName: 'useNavigationMenuContext',
    },
);

/* -------------------------------------------------------------------------------------------------
 * NavigationMenu.Root
 * -----------------------------------------------------------------------------------------------*/

type NavigationMenuVariants = ListVariants & ItemVariants & LinkVariants;
type RootPrimitiveProps = VComponentProps<typeof BaseNavigationMenu.Root>;

interface NavigationMenuRootProps extends RootPrimitiveProps, NavigationMenuVariants {
    'aria-label': string;
}

const Root = forwardRef<HTMLElement, NavigationMenuRootProps>(
    ({ 'aria-label': ariaLabel, ...props }, ref) => {
        const [variantProps, otherProps] = createSplitProps<NavigationMenuVariants>()(props, [
            'direction',
            'size',
            'stretch',
            'align',
            'disabled',
        ]);

        const { direction } = variantProps;

        return (
            <NavigationMenuProvider value={variantProps}>
                <BaseNavigationMenu.Root
                    ref={ref}
                    orientation={direction}
                    aria-label={ariaLabel}
                    {...otherProps}
                />
            </NavigationMenuProvider>
        );
    },
);
Root.displayName = 'NavigationMenu.Root';

/* -------------------------------------------------------------------------------------------------
 * NavigationMenu.List
 * -----------------------------------------------------------------------------------------------*/

type ListPrimitiveProps = VComponentProps<typeof BaseNavigationMenu.List>;
interface NavigationMenuListProps extends ListPrimitiveProps {}

const List = forwardRef<HTMLDivElement, NavigationMenuListProps>(({ className, ...props }, ref) => {
    const { direction, stretch } = useNavigationMenuContext();

    return (
        <BaseNavigationMenu.List
            ref={ref}
            className={clsx(styles.list({ direction, stretch }), className)}
            {...props}
        />
    );
});
List.displayName = 'NavigationMenu.List';

/* -------------------------------------------------------------------------------------------------
 * NavigationMenu.Item
 * -----------------------------------------------------------------------------------------------*/

type ItemPrimitiveProps = VComponentProps<typeof BaseNavigationMenu.Item>;
interface NavigationMenuItemProps extends ItemPrimitiveProps {}

const Item = forwardRef<HTMLDivElement, NavigationMenuItemProps>(({ className, ...props }, ref) => {
    const { stretch } = useNavigationMenuContext();

    return (
        <BaseNavigationMenu.Item
            ref={ref}
            className={clsx(styles.item({ stretch }), className)}
            {...props}
        />
    );
});
Item.displayName = 'NavigationMenu.Item';

/* -------------------------------------------------------------------------------------------------
 * NavigationMenu.Link
 * -----------------------------------------------------------------------------------------------*/

type LinkPrimitiveProps = Omit<VComponentProps<typeof BaseNavigationMenu.Link>, 'active'>;
interface NavigationMenuLinkProps extends LinkPrimitiveProps {
    selected?: boolean;
    disabled?: boolean;
}

const Link = forwardRef<HTMLAnchorElement, NavigationMenuLinkProps>(
    ({ selected, disabled, href, className, ...props }, ref) => {
        const { size, align } = useNavigationMenuContext();

        return (
            <BaseNavigationMenu.Link
                ref={ref}
                href={disabled ? undefined : href}
                aria-current={selected ? 'page' : undefined}
                aria-disabled={disabled ? 'true' : undefined}
                data-selected={selected ? 'true' : undefined}
                className={clsx(styles.link({ size, align, disabled }), className)}
                {...props}
            />
        );
    },
);
Link.displayName = 'NavigationMenu.Link';

/* -------------------------------------------------------------------------------------------------
 * NavigationMenu.LinkItem
 * -----------------------------------------------------------------------------------------------*/

interface NavigationMenuLinkItemProps extends VComponentProps<typeof Link> {}

const LinkItem = forwardRef<HTMLAnchorElement, NavigationMenuLinkItemProps>((props, ref) => {
    return (
        <NavigationMenu.Item>
            <NavigationMenu.Link ref={ref} {...props} />
        </NavigationMenu.Item>
    );
});
LinkItem.displayName = 'NavigationMenu.LinkItem';

/* -------------------------------------------------------------------------------------------------
 * NavigationMenu.Trigger
 * -----------------------------------------------------------------------------------------------*/

type TriggerPrimitiveProps = VComponentProps<typeof BaseNavigationMenu.Trigger>;
interface NavigationMenuTriggerProps extends TriggerPrimitiveProps {}

const Trigger = forwardRef<HTMLButtonElement, NavigationMenuTriggerProps>(
    ({ disabled: disabledProp, className, ...props }, ref) => {
        const { size, align, disabled: contextDisabled } = useNavigationMenuContext();
        const disabled = disabledProp || contextDisabled;

        return (
            <BaseNavigationMenu.Trigger
                ref={ref}
                disabled={disabled}
                className={clsx(styles.trigger({ size, align, disabled }), className)}
                {...props}
            />
        );
    },
);
Trigger.displayName = 'NavigationMenu.Trigger';

/* -------------------------------------------------------------------------------------------------
 * NavigationMenu.TriggerIndicator
 * -----------------------------------------------------------------------------------------------*/

type TriggerIndicatorPrimitiveProps = VComponentProps<typeof BaseNavigationMenu.Icon>;
interface NavigationMenuTriggerIndicatorProps extends TriggerIndicatorPrimitiveProps {}

const TriggerIndicator = forwardRef<HTMLDivElement, NavigationMenuTriggerIndicatorProps>(
    ({ className, children, ...props }, ref) => {
        const IconElement = createSlot(children || <ChevronDownOutlineIcon />);

        return (
            <BaseNavigationMenu.Icon ref={ref} className={clsx(styles.icon, className)} {...props}>
                <IconElement />
            </BaseNavigationMenu.Icon>
        );
    },
);
TriggerIndicator.displayName = 'NavigationMenu.TriggerIndicator';

/* -------------------------------------------------------------------------------------------------
 * NavigationMenu.Panel
 * -----------------------------------------------------------------------------------------------*/

type PanelPrimitiveProps = VComponentProps<typeof BaseNavigationMenu.Content>;
interface NavigationMenuPanelProps extends PanelPrimitiveProps {}

const Panel = forwardRef<HTMLDivElement, NavigationMenuPanelProps>(({ ...props }, ref) => {
    return <BaseNavigationMenu.Content ref={ref} {...props} />;
});
Panel.displayName = 'NavigationMenu.Panel';

/* -------------------------------------------------------------------------------------------------
 * NavigationMenu.Portal
 * -----------------------------------------------------------------------------------------------*/

type PortalPrimitiveProps = VComponentProps<typeof BaseNavigationMenu.Portal>;
interface NavigationMenuPortalProps extends PortalPrimitiveProps {}

const Portal = (props: NavigationMenuPortalProps) => {
    return <BaseNavigationMenu.Portal {...props} />;
};
Portal.displayName = 'NavigationMenu.Portal';

/* -------------------------------------------------------------------------------------------------
 * NavigationMenu.Positioner
 * -----------------------------------------------------------------------------------------------*/

type PositionerPrimitiveProps = VComponentProps<typeof BaseNavigationMenu.Positioner>;
interface NavigationMenuPositionerProps extends PositionerPrimitiveProps {}

const Positioner = forwardRef<HTMLDivElement, NavigationMenuPositionerProps>(
    ({ side = 'bottom', align = 'center', sideOffset = 8, collisionAvoidance, ...props }, ref) => {
        return (
            <BaseNavigationMenu.Positioner
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
Positioner.displayName = 'NavigationMenu.Positioner';

/* -------------------------------------------------------------------------------------------------
 * NavigationMenu.Popup
 * -----------------------------------------------------------------------------------------------*/

const DATA_SIDE = 'data-side';
const DATA_ALIGN = 'data-align';

type PopupPrimitiveProps = VComponentProps<typeof BaseNavigationMenu.Popup>;
interface NavigationMenuPopupProps extends PopupPrimitiveProps {}

const Popup = forwardRef<HTMLElement, NavigationMenuPopupProps>(
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
            <BaseNavigationMenu.Popup
                ref={composedRef}
                className={clsx(styles.popup, className)}
                {...props}
            >
                <BaseNavigationMenu.Arrow ref={arrowRef} style={position} className={styles.arrow}>
                    <ArrowIcon />
                </BaseNavigationMenu.Arrow>

                {children}
            </BaseNavigationMenu.Popup>
        );
    },
);
Popup.displayName = 'NavigationMenu.Popup';

const extractPositions = (dataset: DOMStringMap) => {
    const currentSide = dataset.side as PositionerPrimitiveProps['side'];
    const currentAlign = dataset.align as PositionerPrimitiveProps['align'];
    return { side: currentSide, align: currentAlign };
};

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
/* -------------------------------------------------------------------------------------------------
 * NavigationMenu.Content
 * -----------------------------------------------------------------------------------------------*/

type ContentPrimitiveProps = VComponentProps<typeof Popup>;
interface NavigationMenuContentProps extends ContentPrimitiveProps {}

const Content = forwardRef<HTMLDivElement, NavigationMenuContentProps>((props, ref) => {
    return (
        <Portal>
            <Positioner>
                <Popup ref={ref} {...props} />
            </Positioner>
        </Portal>
    );
});
Content.displayName = 'NavigationMenu.Content';

/* -------------------------------------------------------------------------------------------------
 * NavigationMenu.Viewport
 * -----------------------------------------------------------------------------------------------*/

type ViewportPrimitiveProps = VComponentProps<typeof BaseNavigationMenu.Viewport>;
interface NavigationMenuViewportProps extends ViewportPrimitiveProps {}

const Viewport = (props: NavigationMenuViewportProps) => {
    return <BaseNavigationMenu.Viewport {...props} />;
};
Viewport.displayName = 'NavigationMenu.Viewport';

/* -----------------------------------------------------------------------------------------------*/

export {
    Root as NavigationMenuRoot,
    List as NavigationMenuList,
    Item as NavigationMenuItem,
    Link as NavigationMenuLink,
    Trigger as NavigationMenuTrigger,
    TriggerIndicator as NavigationMenuTriggerIndicator,
    Panel as NavigationMenuPanel,
    Portal as NavigationMenuPortal,
    Positioner as NavigationMenuPositioner,
    Popup as NavigationMenuPopup,
    Viewport as NavigationMenuViewport,
    LinkItem as NavigationMenuLinkItem,
};

export type {
    NavigationMenuRootProps,
    NavigationMenuListProps,
    NavigationMenuItemProps,
    NavigationMenuLinkProps,
    NavigationMenuTriggerProps,
    NavigationMenuTriggerIndicatorProps,
    NavigationMenuPanelProps,
    NavigationMenuPortalProps,
    NavigationMenuPositionerProps,
    NavigationMenuPopupProps,
    NavigationMenuViewportProps,
    NavigationMenuLinkItemProps,
};

export const NavigationMenu = {
    Root,
    List,
    Item,
    Link,
    Trigger,
    TriggerIndicator,
    Panel,
    Portal,
    Positioner,
    Popup,
    Viewport,
    LinkItem,
};
