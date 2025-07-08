import { forwardRef } from 'react';

import {
    Item as RadixItem,
    Link as RadixLink,
    List as RadixList,
    Root as RadixRoot,
} from '@radix-ui/react-navigation-menu';
import clsx from 'clsx';

import { createContext } from '~/libs/create-context';
import { type VaporComponentProps, splitLayoutProps } from '~/libs/factory';
import { sprinkles } from '~/styles/sprinkles.css';
import { createSplitProps } from '~/utils/create-split-props';

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
type NavPrimitiveProps = VaporComponentProps<typeof RadixRoot>;

type NavRootProps = NavPrimitiveProps &
    NavVariants & {
        'aria-label': string;
    };

const Root = forwardRef<HTMLElement, NavRootProps>(
    ({ 'aria-label': ariaLabel, className, ...props }, ref) => {
        const [layoutProps, navProps] = splitLayoutProps(props);
        const [variantProps, otherProps] = createSplitProps<NavVariants>()(navProps, [
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
                <RadixRoot
                    ref={ref}
                    orientation={direction}
                    aria-label={ariaLabel || undefined}
                    className={clsx(sprinkles(layoutProps), className)}
                    {...otherProps}
                />
            </NavProvider>
        );
    },
);
Root.displayName = 'Nav.Root';

/* -------------------------------------------------------------------------------------------------
 * Nav.List
 * -----------------------------------------------------------------------------------------------*/

type ListPrimitiveProps = VaporComponentProps<typeof RadixList>;
type NavMenuList = ListPrimitiveProps;

const List = forwardRef<HTMLUListElement, NavMenuList>(({ className, ...props }, ref) => {
    const { direction, stretch } = useNavContext();
    const [layoutProps, otherProps] = splitLayoutProps(props);

    return (
        <RadixList
            ref={ref}
            className={clsx(styles.list({ direction, stretch }), sprinkles(layoutProps), className)}
            {...otherProps}
        />
    );
});
List.displayName = 'Nav.List';

/* -------------------------------------------------------------------------------------------------
 * Nav.Item
 * -----------------------------------------------------------------------------------------------*/

type ItemPrimitiveProps = VaporComponentProps<typeof RadixItem>;
type NavItemProps = ItemPrimitiveProps;

const Item = forwardRef<HTMLLIElement, NavItemProps>(({ className, ...props }, ref) => {
    const { stretch } = useNavContext();
    const [layoutProps, otherProps] = splitLayoutProps(props);

    return (
        <RadixItem
            ref={ref}
            className={clsx(styles.item({ stretch }), sprinkles(layoutProps), className)}
            {...otherProps}
        />
    );
});
Item.displayName = 'Nav.Item';

/* -------------------------------------------------------------------------------------------------
 * Nav.Link
 * -----------------------------------------------------------------------------------------------*/

type LinkPrimitiveProps = Omit<VaporComponentProps<typeof RadixLink>, 'active'>;
type NavLinkProps = LinkPrimitiveProps & {
    selected?: boolean;
    disabled?: boolean;
};

const Link = forwardRef<HTMLAnchorElement, NavLinkProps>(
    ({ selected, disabled, href, className, ...props }, ref) => {
        const { shape, size, align } = useNavContext();
        const [layoutProps, otherProps] = splitLayoutProps(props);

        return (
            <RadixLink
                ref={ref}
                href={disabled ? undefined : href}
                active={selected}
                data-active={undefined}
                data-selected={selected ? 'true' : undefined}
                aria-disabled={disabled ? 'true' : undefined}
                className={clsx(
                    styles.link({ shape, size, align, disabled }),
                    sprinkles(layoutProps),
                    className,
                )}
                {...otherProps}
            />
        );
    },
);
Link.displayName = 'Nav.Link';

/* -------------------------------------------------------------------------------------------------
 * Nav.LinkItem
 * -----------------------------------------------------------------------------------------------*/

type NavLinkItemProps = VaporComponentProps<typeof RadixLink>;

const LinkItem = forwardRef<HTMLAnchorElement, NavLinkProps>((props, ref) => {
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
