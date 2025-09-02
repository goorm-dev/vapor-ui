'use client';

import { forwardRef } from 'react';

import { NavigationMenu as BaseNavigationMenu } from '@base-ui-components/react';
import clsx from 'clsx';

import { createContext } from '~/libs/create-context';
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

const Trigger = forwardRef<HTMLButtonElement, NavigationMenuTriggerProps>(({ ...props }, ref) => {
    return <BaseNavigationMenu.Trigger ref={ref} {...props} />;
});
Trigger.displayName = 'NavigationMenu.Trigger';

/* -------------------------------------------------------------------------------------------------
 * NavigationMenu.TriggerIndicator
 * -----------------------------------------------------------------------------------------------*/

type TriggerIndicatorPrimitiveProps = VComponentProps<typeof BaseNavigationMenu.Icon>;
interface NavigationMenuTriggerIndicatorProps extends TriggerIndicatorPrimitiveProps {}

const TriggerIndicator = forwardRef<HTMLDivElement, NavigationMenuTriggerIndicatorProps>(
    ({ ...props }, ref) => {
        return <BaseNavigationMenu.Icon ref={ref} {...props} />;
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

const Positioner = (props: NavigationMenuPositionerProps) => {
    return <BaseNavigationMenu.Positioner {...props} />;
};
Positioner.displayName = 'NavigationMenu.Positioner';

/* -------------------------------------------------------------------------------------------------
 * NavigationMenu.Popup
 * -----------------------------------------------------------------------------------------------*/

type PopupPrimitiveProps = VComponentProps<typeof BaseNavigationMenu.Popup>;
interface NavigationMenuPopupProps extends PopupPrimitiveProps {}

const Popup = (props: NavigationMenuPopupProps) => {
    return <BaseNavigationMenu.Popup {...props} />;
};
Popup.displayName = 'NavigationMenu.Popup';

/* -------------------------------------------------------------------------------------------------
 * NavigationMenu.Viewport
 * -----------------------------------------------------------------------------------------------*/

type ViewportPrimitiveProps = VComponentProps<typeof BaseNavigationMenu.Viewport>;
interface ViewportProps extends ViewportPrimitiveProps {}

const Viewport = (props: ViewportProps) => {
    return <BaseNavigationMenu.Viewport {...props} />;
};
Viewport.displayName = 'NavigationMenu.Viewport';

/* -----------------------------------------------------------------------------------------------*/

export {
    Root as NavigationMenuRoot,
    List as NavigationMenuList,
    Item as NavigationMenuItem,
    Link as NavigationMenuLink,
    LinkItem as NavigationMenuLinkItem,
};

export type {
    NavigationMenuRootProps,
    NavigationMenuListProps,
    NavigationMenuItemProps,
    NavigationMenuLinkProps,
    NavigationMenuLinkItemProps,
};

export const NavigationMenu = { Root, List, Item, Link, LinkItem };
