'use client';

import { forwardRef } from 'react';

import { NavigationMenu as BaseNav } from '@base-ui-components/react/navigation-menu';
import clsx from 'clsx';

import { createContext } from '~/libs/create-context';
import { createSplitProps } from '~/utils/create-split-props';
import type { VComponentProps } from '~/utils/types';

import type { ItemVariants, LinkVariants, ListVariants } from './nav.css';
import * as styles from './nav.css';

type NavContextType = NavVariants;
const [NavProvider, useNavContext] = createContext<NavContextType>({
    name: 'NavContext',
    providerName: 'NavProvider',
    hookName: 'useNavContext',
});

/* -------------------------------------------------------------------------------------------------
 * Nav.Root
 * -----------------------------------------------------------------------------------------------*/

type NavVariants = ListVariants & ItemVariants & LinkVariants;
type NavPrimitiveProps = VComponentProps<typeof BaseNav.Root>;

interface NavRootProps extends NavPrimitiveProps, NavVariants {
    'aria-label': string;
}

const Root = forwardRef<HTMLElement, NavRootProps>(({ 'aria-label': ariaLabel, ...props }, ref) => {
    const [variantProps, otherProps] = createSplitProps<NavVariants>()(props, [
        'direction',
        'size',
        'shape',
        'stretch',
        'align',
        'disabled',
    ]);

    const { direction } = variantProps;

    return (
        <NavProvider value={variantProps}>
            <BaseNav.Root
                ref={ref}
                orientation={direction}
                aria-label={ariaLabel || undefined}
                {...otherProps}
            />
        </NavProvider>
    );
});
Root.displayName = 'Nav.Root';

/* -------------------------------------------------------------------------------------------------
 * Nav.List
 * -----------------------------------------------------------------------------------------------*/

type ListPrimitiveProps = VComponentProps<typeof BaseNav.List>;
interface NavMenuList extends ListPrimitiveProps {}

const List = forwardRef<HTMLDivElement, NavMenuList>(({ className, ...props }, ref) => {
    const { direction, stretch } = useNavContext();

    return (
        <BaseNav.List
            ref={ref}
            className={clsx(styles.list({ direction, stretch }), className)}
            {...props}
        />
    );
});
List.displayName = 'Nav.List';

/* -------------------------------------------------------------------------------------------------
 * Nav.Item
 * -----------------------------------------------------------------------------------------------*/

type ItemPrimitiveProps = VComponentProps<typeof BaseNav.Item>;
interface NavItemProps extends ItemPrimitiveProps {}

const Item = forwardRef<HTMLDivElement, NavItemProps>(({ className, ...props }, ref) => {
    const { stretch } = useNavContext();

    return (
        <BaseNav.Item ref={ref} className={clsx(styles.item({ stretch }), className)} {...props} />
    );
});
Item.displayName = 'Nav.Item';

/* -------------------------------------------------------------------------------------------------
 * Nav.Link
 * -----------------------------------------------------------------------------------------------*/

type LinkPrimitiveProps = Omit<VComponentProps<typeof BaseNav.Link>, 'active'>;
interface NavLinkProps extends LinkPrimitiveProps {
    selected?: boolean;
    disabled?: boolean;
}

const Link = forwardRef<HTMLAnchorElement, NavLinkProps>(
    ({ selected, disabled, href, className, ...props }, ref) => {
        const { shape, size, align } = useNavContext();

        return (
            <BaseNav.Link
                ref={ref}
                href={disabled ? undefined : href}
                aria-current={selected ? 'page' : undefined}
                aria-disabled={disabled ? 'true' : undefined}
                data-selected={selected ? 'true' : undefined}
                className={clsx(styles.link({ shape, size, align, disabled }), className)}
                {...props}
            />
        );
    },
);
Link.displayName = 'Nav.Link';

/* -------------------------------------------------------------------------------------------------
 * Nav.LinkItem
 * -----------------------------------------------------------------------------------------------*/

interface NavLinkItemProps extends VComponentProps<typeof Link> {}

const LinkItem = forwardRef<HTMLAnchorElement, NavLinkItemProps>((props, ref) => {
    return (
        <Nav.Item>
            <Nav.Link ref={ref} {...props} />
        </Nav.Item>
    );
});
LinkItem.displayName = 'Nav.LinkItem';

/* -----------------------------------------------------------------------------------------------*/

export {
    Root as NavRoot,
    List as NavList,
    Item as NavItem,
    Link as NavLink,
    LinkItem as NavLinkItem,
};
export type { NavRootProps, NavMenuList, NavItemProps, NavLinkProps, NavLinkItemProps };

export const Nav = { Root, List, Item, Link, LinkItem };
